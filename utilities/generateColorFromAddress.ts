export const generateColorFromAddress = (address: string): string => {
    // String'i hash'e çevirme işlemi (basit bir örnek)
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
        hash = (hash << 5) - hash + address.charCodeAt(i);
        hash |= 0; // 32-bit integer olarak işaretle
    }

    // Renk üretme işlemi
    const color = `#${((hash >>> 0) & 0xFFFFFF).toString(16).padStart(6, '0')}`;

    return color;
}

