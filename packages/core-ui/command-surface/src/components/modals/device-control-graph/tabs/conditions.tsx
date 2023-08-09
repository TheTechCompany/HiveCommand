import { Box } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { QueryBuilder, RuleProps, useRule, formatQuery, Rule } from 'react-querybuilder';
import 'react-querybuilder/dist/query-builder.css';

export const ConditionBuilder = (props) => {

    const [query, setQuery] = useState(props.conditions || {combinator: 'and', rules: [] })

    const rule = useMemo(() => AlarmRule(props.types), []);

    useEffect(() => {
        // const sql = formatQuery(query, 'sql')
        // console.log(sql, query)
        setQuery(props.conditions)
    }, [props.conditions]);
    
    return (
    <Box sx={{flex: 1}}>
            <QueryBuilder 
            query={props.conditions}
            onQueryChange={(query) => props.onChange?.(query)}
             controlElements={{
                rule
            }}
                fields={props.tags.map((tag) => ({
                    label: tag.name,
                    name: tag.name,
                    inputType: tag.type
                }))}
                />
    </Box>
    )
}


export const AlarmRule = (types: any[]) => (props: RuleProps) => {
    const r = { ...props, ...useRule(props) };

    // const { refetch, program: {templates, components, tags, types} } = useCommandEditor()
  
    if (types.findIndex((idx) => idx.name == props.schema.fieldMap[props.rule.field]?.inputType) > -1) {
      const {
        schema: {
          controls: {
            fieldSelector: FieldSelectorControlElement,
            removeRuleAction: RemoveRuleActionControlElement,
          },
        },
      } = props;
  
      const [cloneRule, toggleLockRule, removeRule] = [
        r.cloneRule,
        r.toggleLockRule,
        r.removeRule,
      ].map(f => (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        f();
      });
  
      const fieldChangeHandler = r.generateOnChangeHandler('field');
      const valueChangeHandler = r.generateOnChangeHandler('value');
  
      return (
        <div
          ref={r.dndRef}
          data-dragmonitorid={r.dragMonitorId}
          data-dropmonitorid={r.dropMonitorId}
          className={r.outerClassName}
          data-rule-id={r.id}
          data-level={r.path.length}
          data-path={JSON.stringify(r.path)}
          style={{ display: 'block' }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <FieldSelectorControlElement
              options={r.schema.fields}
              title={r.translations.fields.title}
              value={r.rule.field}
              operator={r.rule.operator}
              className={r.classNames.fields}
              handleOnChange={fieldChangeHandler}
              rule={r.rule}
              level={r.path.length}
              path={r.path}
              disabled={r.disabled}
              context={r.context}
              validation={r.validationResult}
              schema={r.schema}
            />
            <RemoveRuleActionControlElement
              label={r.translations.removeRule.label}
              title={r.translations.removeRule.title}
              className={r.classNames.removeRule}
              handleOnClick={removeRule as any}
            //   rule={r.rule}
              level={r.path.length}
              path={r.path}
              disabled={r.disabled}
              context={r.context}
              validation={r.validationResult}
              ruleOrGroup={r.rule}
              schema={r.schema}
            />
          </div>
          <QueryBuilder
            fields={types.find((idx) => idx.name == props.schema.fieldMap[props.rule.field]?.inputType)?.fields?.map((x) => ({
                name: x.name,
                label: x.name
            })) || []}
            query={props.value}
            onQueryChange={valueChangeHandler}
          />
        </div>
      );
    }
  
    return <Rule {...props} />;
  };