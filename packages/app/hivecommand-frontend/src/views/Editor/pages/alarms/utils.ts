import { DefaultOperatorName, DefaultRuleGroupType, DefaultRuleGroupTypeAny, DefaultRuleGroupTypeIC, DefaultRuleType, Field, OptionList, ParseMongoDbOptions, RuleProcessor, ValueSources, convertToIC, filterFieldsByComparator, getValueSourcesUtil, isOptionGroupArray, isRuleGroupType, numericRegex, objectKeys, toArray, trimIfString, uniqByName } from "react-querybuilder";

const emptyRuleGroup: DefaultRuleGroupType = { combinator: 'and', rules: [] };

export const getRegExStr = (re: string | RegExp) => (typeof re === 'string' ? re : re.source);

export const isPrimitive = (v: any): v is string | number | boolean =>
  typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

export const isPojo = (obj: any): obj is Record<string, any> => {
    console.log("isPOJO", {obj})
  return obj === null || typeof obj !== 'object' ? false : Object.getPrototypeOf(obj) === Object.prototype;
}


export const isValidValue = (v: any) =>
  (typeof v === 'string' && v.length > 0) ||
  (typeof v === 'number' && !isNaN(v)) ||
  (typeof v !== 'string' && typeof v !== 'number');

export const shouldRenderAsNumber = (v: any, parseNumbers?: boolean) =>
  parseNumbers &&
  (typeof v === 'number' ||
    typeof v === 'bigint' ||
    (typeof v === 'string' && numericRegex.test(v)));

    
export const mongoOperators = {
    '=': '$eq',
    '!=': '$ne',
    '<': '$lt',
    '<=': '$lte',
    '>': '$gt',
    '>=': '$gte',
    in: '$in',
    notIn: '$nin',
  };

export const defaultOperatorNegationMap: Record<DefaultOperatorName, DefaultOperatorName> = {
    '=': '!=',
    '!=': '=',
    '<': '>=',
    '<=': '>',
    '>': '<=',
    '>=': '<',
    beginsWith: 'doesNotBeginWith',
    doesNotBeginWith: 'beginsWith',
    endsWith: 'doesNotEndWith',
    doesNotEndWith: 'endsWith',
    contains: 'doesNotContain',
    doesNotContain: 'contains',
    between: 'notBetween',
    notBetween: 'between',
    in: 'notIn',
    notIn: 'in',
    notNull: 'null',
    null: 'notNull',
};

export type MongoDbSupportedOperators =
  | '$and'
  | '$or'
  | '$not'
  | '$eq'
  | '$gt'
  | '$gte'
  | '$in'
  | '$lt'
  | '$lte'
  | '$ne'
  | '$nin'
  | '$regex'
  | '$expr';

export const mongoDbToRqbOperatorMap: { [o in MongoDbSupportedOperators]?: DefaultOperatorName } = {
  $eq: '=',
  $ne: '!=',
  $gt: '>',
  $gte: '>=',
  $lt: '<',
  $lte: '<=',
};

export function parseMongoDB(
    mongoDbRules: string | Record<string, any>,
    options: ParseMongoDbOptions = {}
  ): DefaultRuleGroupTypeAny {
    const listsAsArrays = !!options.listsAsArrays;
    const fieldsFlat = getFieldsArray(options.fields);
    const getValueSources = options.getValueSources;
  
    const fieldIsValid = (
      fieldName: string,
      operator: DefaultOperatorName,
      subordinateFieldName?: string
    ) =>
      fieldIsValidUtil({
        fieldName,
        fieldsFlat,
        operator,
        subordinateFieldName,
        getValueSources,
      });
  
    function processMongoDbQueryBooleanOperator(
      field: string,
      mdbOperator: MongoDbSupportedOperators,
      keyValue: any
    ): DefaultRuleType | false {
      let operator: DefaultOperatorName = '=';
      let value: any = '';
  
      // istanbul ignore else
      if (
        mdbOperator === '$eq' ||
        mdbOperator === '$ne' ||
        mdbOperator === '$gt' ||
        mdbOperator === '$gte' ||
        mdbOperator === '$lt' ||
        mdbOperator === '$lte'
      ) {
        if (mdbOperator === '$ne' && keyValue === null) {
          if (fieldIsValid(field, 'notNull')) {
            return { field, operator: 'notNull', value: null };
          }
        } else {
          operator = mongoDbToRqbOperatorMap[mdbOperator]!;
          if (fieldIsValid(field, operator)) {
            return { field, operator, value: keyValue };
          }
        }
      } else if (mdbOperator === '$regex' && /^[^^].*[^$]$/.test(getRegExStr(keyValue))) {
        if (fieldIsValid(field, 'contains')) {
          return {
            field,
            operator: 'contains',
            value: getRegExStr(keyValue),
          };
        }
      } else if (mdbOperator === '$regex' && /^\^.*[^$]/.test(getRegExStr(keyValue))) {
        if (fieldIsValid(field, 'beginsWith')) {
          return {
            field,
            operator: 'beginsWith',
            value: getRegExStr(keyValue).replace(/^\^/, ''),
          };
        }
      } else if (mdbOperator === '$regex' && /[^^].*\$/.test(getRegExStr(keyValue))) {
        if (fieldIsValid(field, 'endsWith')) {
          return {
            field,
            operator: 'endsWith',
            value: getRegExStr(keyValue).replace(/\$$/, ''),
          };
        }
      } else if (mdbOperator === '$in' && Array.isArray(keyValue)) {
        if (fieldIsValid(field, 'in')) {
          if (listsAsArrays) {
            value = keyValue;
          } else {
            value = keyValue.map(v => `${v}`).join(',');
          }
          return { field, operator: 'in', value };
        }
      } else if (mdbOperator === '$nin' && Array.isArray(keyValue)) {
        if (fieldIsValid(field, 'notIn')) {
          if (listsAsArrays) {
            value = keyValue;
          } else {
            value = keyValue.map(v => `${v}`).join(',');
          }
          return { field, operator: 'notIn', value };
        }
      }
  
      return false;
    }
  
    function processMongoDbQueryObjectKey(
      key: string,
      keyValue: any
    ): DefaultRuleType | DefaultRuleGroupType | false {
      let field = '';
  
      // istanbul ignore else
      if (key === '$and') {
        if (!Array.isArray(keyValue) || keyValue.length === 0 || !keyValue.every(isPojo)) {
            console.log("key is pojo")
          return false;
        }
  
        // Check if this should result in a "between" clause
        if (keyValue.length === 2 && keyValue.every(kv => objectKeys(kv).length === 1)) {
          const [rule1, rule2] = keyValue;
          const [ruleKey1, ruleKey2] = keyValue.map(kv => objectKeys(kv)[0]);
          if (
            ruleKey1 === ruleKey2 &&
            isPojo(rule1[ruleKey1]) &&
            objectKeys(rule1[ruleKey1]).length === 1 &&
            isPojo(rule2[ruleKey2]) &&
            objectKeys(rule2[ruleKey2]).length === 1 &&
            (('$gte' in rule1[ruleKey1] &&
              '$lte' in rule2[ruleKey2] &&
              rule2[ruleKey2].$lte >= rule1[ruleKey1].$gte) ||
              ('$lte' in rule1[ruleKey1] &&
                '$gte' in rule2[ruleKey2] &&
                rule1[ruleKey1].$lte >= rule2[ruleKey2].$gte))
          ) {
            const [val1, val2] = [
              rule1[ruleKey1].$gte ?? rule1[ruleKey1].$lte,
              rule2[ruleKey2].$lte ?? rule2[ruleKey2].$gte,
            ];
            let value = listsAsArrays ? [val1, val2] : `${val1},${val2}`;
            if (val1 > val2) {
              value = listsAsArrays ? [val2, val1] : `${val2},${val1}`;
            }
            return { field: ruleKey1, operator: 'between', value };
          }
        }
  
        const rules = keyValue.map(l => processMongoDbQueryObject(l)).filter(Boolean) as (
          | DefaultRuleType
          | DefaultRuleGroupType
        )[];
  
        return rules.length > 0 ? { combinator: 'and', rules } : false;
      } else if (key === '$or') {
        if (!Array.isArray(keyValue) || keyValue.length === 0 || !keyValue.every(isPojo)) {
          return false;
        }
  
        // Check if this should result in "notBetween"
        if (keyValue.length === 2 && keyValue.every(kv => objectKeys(kv).length === 1)) {
          const [rule1, rule2] = keyValue;
          const [ruleKey1, ruleKey2] = keyValue.map(kv => objectKeys(kv)[0]);
          if (
            ruleKey1 === ruleKey2 &&
            isPojo(rule1[ruleKey1]) &&
            objectKeys(rule1[ruleKey1]).length === 1 &&
            isPojo(rule2[ruleKey2]) &&
            objectKeys(rule2[ruleKey2]).length === 1 &&
            (('$gt' in rule1[ruleKey1] &&
              '$lt' in rule2[ruleKey2] &&
              rule1[ruleKey1].$gt >= rule2[ruleKey2].$lt) ||
              ('$lt' in rule1[ruleKey1] &&
                '$gt' in rule2[ruleKey2] &&
                rule2[ruleKey2].$gt >= rule1[ruleKey1].$lt))
          ) {
            const [val1, val2] = [
              rule1[ruleKey1].$gt ?? rule1[ruleKey1].$lt,
              rule2[ruleKey2].$lt ?? rule2[ruleKey2].$gt,
            ];
            let value = listsAsArrays ? [val1, val2] : `${val1},${val2}`;
            if (val1 > val2) {
              value = listsAsArrays ? [val2, val1] : `${val2},${val1}`;
            }
            return { field: ruleKey1, operator: 'notBetween', value };
          }
        }
  
        const rules = keyValue.map(l => processMongoDbQueryObject(l)).filter(Boolean) as (
          | DefaultRuleType
          | DefaultRuleGroupType
        )[];
  
        return rules.length > 0 ? { combinator: 'or', rules } : false;
      } else if (key === '$not' && isPojo(keyValue)) {
        const rule = processMongoDbQueryObject(keyValue);
        if (rule) {
          if (
            !isRuleGroupType(rule) &&
            (rule.operator === 'between' ||
              rule.operator === 'in' ||
              rule.operator === 'contains' ||
              rule.operator === 'beginsWith' ||
              rule.operator === 'endsWith')
          ) {
            return { ...rule, operator: defaultOperatorNegationMap[rule.operator] };
          }
          return { combinator: 'and', rules: [rule], not: true };
        }
        return false;
      } else if (key === '$expr') {
        const op = objectKeys(keyValue)[0] as MongoDbSupportedOperators;
        if (/^\$(eq|gte?|lte?|n?in)$/.test(op)) {
          if (
            Array.isArray(keyValue[op]) &&
            keyValue[op].length === 2 &&
            typeof keyValue[op][0] === 'string' &&
            /^\$/.test(keyValue[op][0])
          ) {
            field = keyValue[op][0].replace(/^\$/, '');
            const val = keyValue[op][1];
            if (
              (typeof val === 'string' && /^\$/.test(val)) ||
              (Array.isArray(val) &&
                val.every(v => typeof v === 'string') &&
                val.every(v => /^\$/.test(v)))
            ) {
              const valForProcessing = Array.isArray(val)
                ? val.map(v => v.replace(/^\$/, ''))
                : val.replace(/^\$/, '');
              const tempRule = processMongoDbQueryBooleanOperator(field, op, valForProcessing);
              if (tempRule) {
                if (
                  typeof tempRule.value === 'string' &&
                  !fieldIsValid(field, tempRule.operator, tempRule.value)
                ) {
                  return false;
                }
                return { ...tempRule, valueSource: 'field' };
              }
            }
            return processMongoDbQueryBooleanOperator(field, op, keyValue[op][1]);
          }
        }
      } else if (/^[^$]/.test(key)) {
        console.log(field, "is Test");
        field = key;
  
        if (isPrimitive(keyValue)) {
          if (fieldIsValid(field, '=')) {
            return { field, operator: '=', value: keyValue };
          }
        } else if (keyValue === null) {
          if (fieldIsValid(field, 'null')) {
            return { field, operator: 'null', value: keyValue };
          }
        } else if (isPojo(keyValue)) {
          let betweenRule: DefaultRuleType | false = false;
  
          const operators = objectKeys(keyValue)
            .filter(o => /^\$(eq|ne|gte?|lte?|n?in|regex)$/.test(o))
            .sort() as MongoDbSupportedOperators[];
        
          if (operators.length === 0) {
            console.log({operators: keyValue, field})

            return {
                field,
                operator: '=',
                value: parseMongoDB(keyValue)
                // {
                //     combinator: 'and', 
                //     rules: objectKeys(keyValue).map((key) => ({
                //         field: key,
                //         operator: '=',
                //         value: keyValue[key]
                //     }))
                // }
            }
            return false;
          }
  
          if ('$gte' in keyValue && '$lte' in keyValue) {
            // This is (at least) a compact "between" clause
            betweenRule = {
              field,
              operator: 'between',
              value: listsAsArrays
                ? [keyValue.$gte, keyValue.$lte]
                : `${keyValue.$gte},${keyValue.$lte}`,
            };
          }
  
          const rules = operators
            // filter out $gte and $lte if they were both present
            .filter(op => !(betweenRule && (op === '$gte' || op === '$lte')))
            .map(op => processMongoDbQueryBooleanOperator(field, op, keyValue[op]))
            .filter(Boolean) as (DefaultRuleGroupType | DefaultRuleType)[];
  
          if (betweenRule) {
            rules.unshift(betweenRule);
          }
  
          if (rules.length === 0) {
            return false;
          }
          if (rules.length === 1) {
            return rules[0];
          }
          return { combinator: 'and', rules };
        }
      }else{
        console.log("Fell through")
      }
  
      return false;
    }
  
    function processMongoDbQueryObject(
      mongoDbQueryObject: Record<string, any>
    ): DefaultRuleGroupType | DefaultRuleType | false {
      const rules = objectKeys(mongoDbQueryObject)
        .map(k => processMongoDbQueryObjectKey(k, mongoDbQueryObject[k]))
        .filter(Boolean) as DefaultRuleGroupType[];
      return rules.length === 1 ? rules[0] : rules.length > 1 ? { combinator: 'and', rules } : false;
    }
  
    let mongoDbPOJO = mongoDbRules;
    if (typeof mongoDbRules === 'string') {
      try {
        mongoDbPOJO = JSON.parse(mongoDbRules);
      } catch (err) {
        return emptyRuleGroup;
      }
    }
    console.log(isPojo(mongoDbPOJO));
    // Bail if the mongoDbPOJO is not actually a POJO
    if (!isPojo(mongoDbPOJO)) {
      return emptyRuleGroup;
    }
  
    const result = processMongoDbQueryObject(mongoDbPOJO as Record<string, any>);
    
    const finalQuery: DefaultRuleGroupType = result
      ? isRuleGroupType(result)
        ? result
        : { combinator: 'and', rules: [result] }
      : emptyRuleGroup;
      console.log({finalQuery})
    return options.independentCombinators
      ? convertToIC<DefaultRuleGroupTypeIC>(finalQuery)
      : finalQuery;
  }


export const getFieldsArray = (fields?: OptionList<Field> | Record<string, Field>) => {
    let fieldsFlat: Field[] = [];
    const fieldsArray = !fields
      ? []
      : Array.isArray(fields)
      ? fields
      : Object.keys(fields)
          .map(fld => ({ ...fields[fld], name: fld }))
          .sort((a, b) => a.label.localeCompare(b.label));
    if (isOptionGroupArray(fieldsArray)) {
      fieldsFlat = uniqByName(fieldsFlat.concat(...fieldsArray.map(opt => opt.options)));
    } else {
      fieldsFlat = uniqByName(fieldsArray);
    }
    return fieldsFlat;
  };
  
  export function fieldIsValidUtil({
    fieldsFlat,
    fieldName,
    operator,
    subordinateFieldName,
    getValueSources,
  }: {
    fieldsFlat: Field[];
    getValueSources?: (field: string, operator: string) => ValueSources;
    fieldName: string;
    operator: DefaultOperatorName;
    subordinateFieldName?: string;
  }) {
    // If fields option was an empty array or undefined, then all identifiers
    // are considered valid.
    if (fieldsFlat.length === 0) return true;
  
    let valid = false;
  
    const primaryField = fieldsFlat.find(ff => ff.name === fieldName);
    if (primaryField) {
      if (
        !subordinateFieldName &&
        operator !== 'notNull' &&
        operator !== 'null' &&
        !getValueSourcesUtil(primaryField, operator, getValueSources).some(vs => vs === 'value')
      ) {
        valid = false;
      } else {
        valid = true;
      }
  
      if (valid && !!subordinateFieldName) {
        if (
          getValueSourcesUtil(primaryField, operator, getValueSources).some(vs => vs === 'field') &&
          fieldName !== subordinateFieldName
        ) {
          const validSubordinateFields = filterFieldsByComparator(
            primaryField,
            fieldsFlat,
            operator
          ) as Field[];
          if (!validSubordinateFields.find(vsf => vsf.name === subordinateFieldName)) {
            valid = false;
          }
        } else {
          valid = false;
        }
      }
    }
  
    return valid;
  }


const escapeDoubleQuotes = (v: any) =>
typeof v !== 'string' ? v : v.replaceAll('\\', '\\\\').replaceAll(`"`, `\\"`);

export const defaultRuleProcessorMongoDB: RuleProcessor = (
{ field, operator, value, valueSource },
// istanbul ignore next
{ parseNumbers } = {}
) => {
const valueIsField = valueSource === 'field';
const useBareValue =
  typeof value === 'number' ||
  typeof value === 'boolean' ||
  typeof value === 'bigint' ||
  shouldRenderAsNumber(value, parseNumbers);

console.log(operator, valueIsField);
if (operator === '=' && !valueIsField) {
    console.log(field, value, typeof(value))
    if(typeof(value)=='object' && !Array.isArray(value)) return `{"${field}":${JSON.stringify(value).replace('\\"', '"')}}`

  return `{"${field}":${useBareValue ? trimIfString(value) : `"${escapeDoubleQuotes(value)}"`}}`;
}

switch (operator) {
  case '<':
  case '<=':
  case '=':
  case '!=':
  case '>':
  case '>=': {
    const mongoOperator = mongoOperators[operator];
    console.log(operator);
    return valueIsField
      ? `{"$expr":{"${mongoOperator}":["$${field}","$${value}"]}}`
      : `{"${field}":{"${mongoOperator}":${
          useBareValue ? trimIfString(value) : `"${escapeDoubleQuotes(value)}"`
        }}}`;
  }

  case 'contains':
    return valueIsField
      ? `{"$where":"this.${field}.includes(this.${value})"}`
      : `{"${field}":{"$regex":"${escapeDoubleQuotes(value)}"}}`;

  case 'beginsWith':
    return valueIsField
      ? `{"$where":"this.${field}.startsWith(this.${value})"}`
      : `{"${field}":{"$regex":"^${escapeDoubleQuotes(value)}"}}`;

  case 'endsWith':
    return valueIsField
      ? `{"$where":"this.${field}.endsWith(this.${value})"}`
      : `{"${field}":{"$regex":"${escapeDoubleQuotes(value)}$"}}`;

  case 'doesNotContain':
    return valueIsField
      ? `{"$where":"!this.${field}.includes(this.${value})"}`
      : `{"${field}":{"$not":{"$regex":"${escapeDoubleQuotes(value)}"}}}`;

  case 'doesNotBeginWith':
    return valueIsField
      ? `{"$where":"!this.${field}.startsWith(this.${value})"}`
      : `{"${field}":{"$not":{"$regex":"^${escapeDoubleQuotes(value)}"}}}`;

  case 'doesNotEndWith':
    return valueIsField
      ? `{"$where":"!this.${field}.endsWith(this.${value})"}`
      : `{"${field}":{"$not":{"$regex":"${escapeDoubleQuotes(value)}$"}}}`;

  case 'null':
    return `{"${field}":null}`;

  case 'notNull':
    return `{"${field}":{"$ne":null}}`;

  case 'in':
  case 'notIn': {
    const valueAsArray = toArray(value);
    if (valueAsArray.length > 0) {
      return valueIsField
        ? `{"$where":"${operator === 'notIn' ? '!' : ''}[${valueAsArray
            .map(val => `this.${val}`)
            .join(',')}].includes(this.${field})"}`
        : `{"${field}":{"${mongoOperators[operator]}":[${valueAsArray
            .map(val =>
              shouldRenderAsNumber(val, parseNumbers)
                ? `${trimIfString(val)}`
                : `"${escapeDoubleQuotes(val)}"`
            )
            .join(',')}]}}`;
    } else {
      return '';
    }
  }

  case 'between':
  case 'notBetween': {
    const valueAsArray = toArray(value);
    if (
      valueAsArray.length >= 2 &&
      isValidValue(valueAsArray[0]) &&
      isValidValue(valueAsArray[1])
    ) {
      const [first, second] = valueAsArray;
      const firstNum = shouldRenderAsNumber(first, true) ? parseFloat(first) : NaN;
      const secondNum = shouldRenderAsNumber(second, true) ? parseFloat(second) : NaN;
      const firstValue =
        valueIsField || !isNaN(firstNum) ? `${first}` : `"${escapeDoubleQuotes(first)}"`;
      const secondValue =
        valueIsField || !isNaN(secondNum) ? `${second}` : `"${escapeDoubleQuotes(second)}"`;
      if (operator === 'between') {
        return valueIsField
          ? `{"$and":[{"$expr":{"$gte":["$${field}","$${firstValue}"]}},{"$expr":{"$lte":["$${field}","$${secondValue}"]}}]}`
          : `{"${field}":{"$gte":${firstValue},"$lte":${secondValue}}}`;
      } else {
        return valueIsField
          ? `{"$or":[{"$expr":{"$lt":["$${field}","$${firstValue}"]}},{"$expr":{"$gt":["$${field}","$${secondValue}"]}}]}`
          : `{"$or":[{"${field}":{"$lt":${firstValue}}},{"${field}":{"$gt":${secondValue}}}]}`;
      }
    } else {
      return '';
    }
  }
}
return '';
};