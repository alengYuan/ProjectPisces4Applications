type SubKeyAndSubSubKey<T> = T extends ({
    [key: string]: {
        [key: string]: null | number | string | Blob,
    },
} | {
    [key: string]: null | number | string | Blob,
})
    ? keyof T | SubKeyAndSubSubKey<T[keyof T]>
    : never;

export type SubSubKey<T> = Exclude<SubKeyAndSubSubKey<T>, keyof T>;