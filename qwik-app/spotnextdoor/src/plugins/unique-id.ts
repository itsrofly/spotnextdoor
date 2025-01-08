export function generateUniqueID(): string {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let uniqueString = '';

    // Get current date components
    const currentDate = new Date();
    const year = currentDate.getFullYear() - 2000; // Convert to two digits
    const month = currentDate.getMonth() + 1; // Month starts from 0
    const day = currentDate.getDate();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();

    // Fill the remaining characters randomly
    while (uniqueString.length < 5) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        uniqueString += characters[randomIndex];
    }

    // Use date components to generate part of the string
    const dateValue = (year * month * day * hours * minutes * seconds).toString();
    const dateStringLength = dateValue.length;
    for (let i = 0; i < dateStringLength && i < 10; i++) {
        const index = parseInt(dateValue[i]);
        uniqueString += characters[index % characters.length];
    }



    return uniqueString.slice(0, 15); // Ensure length is exactly 15 characters
}