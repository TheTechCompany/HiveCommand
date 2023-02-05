export const isStringType = (typeString: string) : [boolean, string] => {
    if(typeString?.indexOf('type://') > -1){
        let match = typeString.match('type:\/\/(.+)')
        if(!match) throw new Error("no match found");

        return [true, match?.[1]];
    }

    return [false, typeString]
}