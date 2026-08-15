export function formatCurrency(valueInCents) {
    if (valueInCents === undefined || valueInCents === null) {
        return "R$ 0,00";
    }
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(valueInCents / 100);
}

export default formatCurrency;
