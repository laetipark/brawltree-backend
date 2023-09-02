export class dateService {
    static getDate = (date) =>
        new Date(Date.UTC(parseInt(date.substring(0, 4)),
            parseInt(date.substring(4, 6)) - 1,
            parseInt(date.substring(6, 8)),
            parseInt(date.substring(9, 11)),
            parseInt(date.substring(11, 13)),
            parseInt(date.substring(13, 15))));
}