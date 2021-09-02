/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0 */

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { device, inputFieldValidations } from '../../constants';
import { InputSection, Label, Input, Error } from './styled';

const InputField = forwardRef((props, ref) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const handleChange = (e) => {
        setValue(e.target.value);
        setError("");
        props.onChange(e.target.name, e.target.value)
    }
    const validate = () => {
        //return true if valid
        //else return false
        if (props.validation) {
            const currentRule = props.validation;
            if (currentRule === inputFieldValidations.REQUIRED) {
                if (!value) {
                    setError("This field is required");
                    return false;
                }
            }  
        }
        return true;
    }
    

    useImperativeHandle(ref, () => {
        return ({
            validate: ()=> validate()
        })
    })

    return (
        <InputSection>
            {props.label && (
                <Label>{ props.label }</Label>
            )}
            <Input
                placeholder={ props.placeholder}
                name={ props.name }
                onChange={(e)=> handleChange(e)}
                type={props.type }
                value={props.value ? props.value : value }
                autoComplete={props.autoComplete}
                device= {device}
            />
            { error && (
                <Error>{ error }</Error>
            )}
        </InputSection>
    );
});

InputField.defaultProps = {
    placeholder: "",
    name: "",
    value: "",
    type: "text",
    autoComplete: "off",
    validation: ''
}

export default InputField;