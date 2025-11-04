export const genSmallId = () => {
    const timestamp = Date.now().toString(36); // Base 36 for compactness
    const randomPart = Math.random().toString(36).substring(2, 7); // 5 random chars
    return `${timestamp}-${randomPart}`;
};
