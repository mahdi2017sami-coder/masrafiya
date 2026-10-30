// محتوى ملف app.js

const apiUrl = 'https://open.er-api.com/v6/latest/USD';
let exchangeRates = {};
let lastUpdate = '';

document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const resultDisplay = document.getElementById('result');
    const swapButton = document.getElementById('swap');
    const quickAmountButtons = document.querySelectorAll('.quick-amount');
    const retryButton = document.getElementById('retry');
    const loadingMessage = document.getElementById('loading');
    const errorMessage = document.getElementById('error');

    // جلب أسعار الصرف عند تحميل الصفحة
    fetchExchangeRates();

    amountInput.addEventListener('input', updateResult);
    fromCurrencySelect.addEventListener('change', updateResult);
    toCurrencySelect.addEventListener('change', updateResult);
    swapButton.addEventListener('click', swapCurrencies);
    quickAmountButtons.forEach(button => {
        button.addEventListener('click', () => {
            amountInput.value = button.dataset.amount;
            updateResult();
        });
    });
    retryButton.addEventListener('click', fetchExchangeRates);

    function fetchExchangeRates() {
        loadingMessage.style.display = 'block';
        errorMessage.hidden = true;
        retryButton.hidden = true;
        fetch(apiUrl, { cache: "no-store" })
            .then(response => {
                if (!response.ok) throw new Error('فشل في جلب البيانات');
                return response.json();
            })
            .then(data => {
                if (data.result !== "success" || !data.rates) throw new Error('فشل في جلب البيانات');
                exchangeRates = data.rates;
                lastUpdate = new Date(data.time_last_update_unix * 1000).toLocaleString('ar-SA');
                document.getElementById('unit-price').textContent = `1 USD = ${formatCurrency(exchangeRates.SAR, 'SAR')}`;
                document.getElementById('last-update').textContent = lastUpdate;
                loadingMessage.style.display = 'none';
                updateResult();
            })
            .catch(error => {
                loadingMessage.style.display = 'none';
                errorMessage.textContent = error.message;
                errorMessage.hidden = false;
                retryButton.hidden = false;
                resultDisplay.textContent = '';
            });
    }

    function updateResult() {
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        if (isNaN(amount) || amount < 0) {
            resultDisplay.textContent = '';
            return;
        }

        if (!Object.keys(exchangeRates).length) {
            resultDisplay.textContent = '';
            return;
        }

        if (fromCurrency === toCurrency) {
            resultDisplay.textContent = formatCurrency(amount, toCurrency);
            return;
        }

        const fromRate = exchangeRates[fromCurrency];
        const toRate = exchangeRates[toCurrency];
        if (!fromRate || !toRate) {
            resultDisplay.textContent = '';
            errorMessage.textContent = 'سعر إحدى العملتين غير متوفر حاليًا.';
            errorMessage.hidden = false;
            return;
        }

        const result = (amount * toRate) / fromRate;
        resultDisplay.textContent = formatCurrency(result, toCurrency);
    }

    function swapCurrencies() {
        const temp = fromCurrencySelect.value;
        fromCurrencySelect.value = toCurrencySelect.value;
        toCurrencySelect.value = temp;
        updateResult();
    }

    function formatCurrency(value, currency) {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: currency
        }).format(value);
    }
});