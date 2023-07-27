import { Box } from '@mui/material';
import { QueryBuilder, Rule, RuleProps, useRule } from 'react-querybuilder';
import React from 'react';
import 'react-querybuilder/dist/query-builder.css';

export const AlarmConditions = () => {
    return (
        <Box>
            <QueryBuilder
                fields={[
                    {name: 'AV101', label: 'AV101', inputType: 'valve'},
                    {name: 'AV201', label: 'AV201', inputType: 'valve'}
                ]}
                
                controlElements={{
                    rule: AlarmRule
                }}
                    />
        </Box>
    )
}


export const AlarmRule = (props: RuleProps) => {
    const r = { ...props, ...useRule(props) };
  
    console.log(props);

    if (props.schema.fieldMap[props.rule.field].inputType === 'valve') {
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
            fields={[{label: 'open', name: "Open"}]}
            query={props.value}
            onQueryChange={valueChangeHandler}
          />
        </div>
      );
    }
  
    return <Rule {...props} />;
  };