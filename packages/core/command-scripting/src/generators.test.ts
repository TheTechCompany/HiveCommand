import { formatInterface } from './generators';
import { DataTypes } from './types';
import prettier from 'prettier'

describe('Generators of scripting extraLibs', () => {
    it('Can generate flat interface', () => {
        const typeDefinition = formatInterface(
            'ValueStore', 
            {
                name: DataTypes.String,
                children: {
                    name: DataTypes.String,
                    item: [DataTypes.Number],
                    jsonItem: [{
                        item: DataTypes.Number,
                        children: [DataTypes.Boolean]
                    }]
                } 
        })
        const cleaned = prettier.format(typeDefinition, {parser: 'babel'})

        const expected = prettier.format(`interface ValueStore {
            name: string;
            children: {
                name: string,
                item: number[],
                jsonItem: { item: number, children: boolean[] }[],
            };
        }`, {parser: 'babel'})

        expect(cleaned).toBe(expected)

    })
})