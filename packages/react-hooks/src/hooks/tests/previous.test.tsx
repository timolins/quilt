import * as React from 'react';
import {mount} from '@shopify/react-testing';

import usePrevious from '../previous';

describe('usePrevious', () => {
  function MockComponent({value}) {
    const previousValue = usePrevious(value);
    return <div>{previousValue}</div>;
  }

  it('inits the previous value to undefined and displays it', () => {
    const wrapper = mount(<MockComponent value={666} />);

    expect(wrapper).toContainReactComponent('div', {children: undefined});
  });

  it('displays previous value after updating value', () => {
    const value = 666;

    const wrapper = mount(<MockComponent value={value} />);

    wrapper.setProps({value: 777});

    expect(wrapper).toContainReactComponent('div', {children: value});
  });
});
