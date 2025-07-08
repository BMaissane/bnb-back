export const validateFutureDate = (dateString: string, fieldName: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
        throw new Error(`La ${fieldName} ne peut pas être dans le passé`);
    }
    return date;
};
