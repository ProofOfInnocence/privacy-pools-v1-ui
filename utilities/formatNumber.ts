export const formatNumber = (ethPrice : string) => {
    let formattedPrice = parseFloat(ethPrice).toFixed(4);
    formattedPrice = formattedPrice.replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    return formattedPrice;
}
