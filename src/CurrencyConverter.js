import React, { useState, useEffect } from 'react';
import axios from 'axios';
import currencyNames from './currencyNames';
import './CurrencyConverter.css';

const CurrencyConverter = () => {
    const [currencies, setCurrencies] = useState([]);
    const [from, setFrom] = useState(localStorage.getItem('fromCurrency') || 'USD');
    const [to, setTo] = useState(localStorage.getItem('toCurrency') || 'EUR');
    const [fromAmount, setFromAmount] = useState(localStorage.getItem('fromAmount') || '');
    const [toAmount, setToAmount] = useState('');
    const [rates, setRates] = useState({});
    const [favorites, setFavorites] = useState(
        JSON.parse(localStorage.getItem('favorites')) || []
    );

    useEffect(() => {
        const API_URL = `${process.env.REACT_APP_API_URL}/currencies`;

        const fetchCurrencies = async () => {
            try {
                const response = await axios.get(API_URL);
                const fetchedCurrencies = Object.keys(response.data.rates);
                setCurrencies(fetchedCurrencies);
                setRates(response.data.rates);
            } catch (error) {
                console.error('Error fetching currencies:', error);
            }
        };

        fetchCurrencies();
        const intervalId = setInterval(fetchCurrencies, 5 * 60 * 1000); // Автообновление каждые 5 минут
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        localStorage.setItem('fromCurrency', from);
        localStorage.setItem('toCurrency', to);
        localStorage.setItem('fromAmount', fromAmount);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [from, to, fromAmount, favorites]);

    useEffect(() => {
        if (fromAmount && rates[to] && rates[from]) {
            const converted = (fromAmount * rates[to] / rates[from]).toFixed(2);
            setToAmount(converted);
        }
    }, [from, to, rates, fromAmount]);

    useEffect(() => {
        if (toAmount && rates[to] && rates[from]) {
            const converted = (toAmount * rates[from] / rates[to]).toFixed(2);
            setFromAmount(converted);
        }
    }, [from, to, rates, toAmount]);

    const handleAmountInput = (value) => {
        return value.replace(/[^0-9.]/g, '');
    };

    const handleFromAmountChange = (amount) => {
        setFromAmount(handleAmountInput(amount));
    };

    const handleToAmountChange = (amount) => {
        setToAmount(handleAmountInput(amount));
    };

    const handleFavoriteToggle = (currency) => {
        setFavorites((prev) => {
            const updated = prev.includes(currency)
                ? prev.filter((fav) => fav !== currency)
                : [...prev, currency];
            return updated;
        });
    };

    const sortedCurrencies = [...favorites, ...currencies.filter((c) => !favorites.includes(c))];

    return (
        <div className="currency-converter">
            <h1>Currency Converter</h1>

            <div className="input-group">
                <input
                    type="text"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="Amount"
                />
                <div className="currency-select">
                    <select value={from} onChange={(e) => setFrom(e.target.value)}>
                        {sortedCurrencies.map((currency) => (
                            <option key={currency} value={currency}>
                                {favorites.includes(currency) ? `★ ${currency}` : currency} - {currencyNames[currency] || 'Unknown'}
                            </option>
                        ))}
                    </select>
                    <button
                        className={favorites.includes(from) ? 'favorite active' : 'favorite'}
                        onClick={() => handleFavoriteToggle(from)}
                    >
                        ★
                    </button>
                </div>
            </div>

            <div className="input-group">
                <input
                    type="text"
                    value={toAmount}
                    onChange={(e) => handleToAmountChange(e.target.value)}
                    placeholder="Converted Amount"
                />
                <div className="currency-select">
                    <select value={to} onChange={(e) => setTo(e.target.value)}>
                        {sortedCurrencies.map((currency) => (
                            <option key={currency} value={currency}>
                                {favorites.includes(currency) ? `★ ${currency}` : currency} - {currencyNames[currency] || 'Unknown'}
                            </option>
                        ))}
                    </select>
                    <button
                        className={favorites.includes(to) ? 'favorite active' : 'favorite'}
                        onClick={() => handleFavoriteToggle(to)}
                    >
                        ★
                    </button>
                </div>
            </div>

            <p>Exchange Rate: {rates[to] && rates[from] ? (rates[to] / rates[from]).toFixed(4) : 'N/A'}</p>
        </div>
    );
};

export default CurrencyConverter;