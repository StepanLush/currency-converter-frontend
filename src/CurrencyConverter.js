import React, { useState, useEffect } from 'react';
import axios from 'axios';
import currencyNames from './currencyNames';

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
        const API_URL = process.env.REACT_APP_API_URL;

        const fetchCurrencies = async () => {
            try {
                const response = await axios.get(API_URL);
                const fetchedCurrencies = Object.keys(response.data.rates);
                setCurrencies(fetchedCurrencies);
                setRates(response.data.rates);
                if (fromAmount) {
                    handleFromAmountChange(fromAmount, response.data.rates);
                }
            } catch (error) {
                console.error('Error fetching currencies:', error);
            }
        };

        fetchCurrencies();
        const intervalId = setInterval(fetchCurrencies, 5 * 60 * 1000); // Автообновление каждые 5 минут
        return () => clearInterval(intervalId);
    }, [fromAmount]);

    useEffect(() => {
        localStorage.setItem('fromCurrency', from);
        localStorage.setItem('toCurrency', to);
        localStorage.setItem('fromAmount', fromAmount);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [from, to, fromAmount, favorites]);

    const handleAmountInput = (value, callback) => {
        const sanitizedValue = value.replace(/[^0-9.]/g, '');
        callback(sanitizedValue);
    };

    const handleFromAmountChange = (amount, currentRates = rates) => {
        handleAmountInput(amount, setFromAmount);
        if (amount && currentRates[to] && currentRates[from]) {
            const converted = (amount * currentRates[to] / currentRates[from]).toFixed(2);
            setToAmount(converted);
        } else {
            setToAmount('');
        }
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

    const handleFromCurrencyChange = (currency) => {
        setFrom(currency);
        if (fromAmount) {
            handleFromAmountChange(fromAmount);
        }
    };

    const handleToCurrencyChange = (currency) => {
        setTo(currency);
        if (toAmount) {
            handleFromAmountChange(fromAmount);
        }
    };

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
                    <select value={from} onChange={(e) => handleFromCurrencyChange(e.target.value)}>
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
                    onChange={(e) => handleFromAmountChange(fromAmount)}
                    placeholder="Amount"
                />
                <div className="currency-select">
                    <select value={to} onChange={(e) => handleToCurrencyChange(e.target.value)}>
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
