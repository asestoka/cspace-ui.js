import React from 'react';
import { createRenderer } from 'react-addons-test-utils';
import Immutable from 'immutable';
import merge from 'lodash/merge';
import SearchPanelContainer from '../../../../src/containers/search/SearchPanelContainer';
import TermsUsedPanel from '../../../../src/components/record/TermsUsedPanel';

const expect = chai.expect;

chai.should();

const recordData = Immutable.fromJS({
  document: {
    'ns2:collectionspace_core': {
      updatedAt: '2017-01-26T08:08:47.026Z',
    },
  },
});

describe('TermsUsedPanel', function suite() {
  it('should render a search panel', function test() {
    const config = {};
    const recordType = 'object';

    const shallowRenderer = createRenderer();

    shallowRenderer.render(
      <TermsUsedPanel
        config={config}
        recordData={recordData}
        recordType={recordType}
      />);

    const result = shallowRenderer.getRenderOutput();

    result.type.should.equal(SearchPanelContainer);

    result.props.config.should.equal(config);
    result.props.recordType.should.equal(recordType);
  });

  it('should render nothing if the record data has not been saved', function test() {
    const config = {};
    const recordType = 'object';

    const unsavedRecordData = Immutable.fromJS({
      document: {
        'ns2:collectionspace_core': {
          updatedAt: null,
        },
      },
    });

    const shallowRenderer = createRenderer();

    shallowRenderer.render(
      <TermsUsedPanel
        config={config}
        recordData={unsavedRecordData}
        recordType={recordType}
      />);

    const result = shallowRenderer.getRenderOutput();

    expect(result).to.equal(null);
  });

  it('should rerender with the new search descriptor when it is changed by the search panel', function test() {
    const config = {};
    const recordType = 'object';

    const shallowRenderer = createRenderer();

    shallowRenderer.render(
      <TermsUsedPanel
        config={config}
        recordData={recordData}
        recordType={recordType}
      />);

    const result = shallowRenderer.getRenderOutput();
    const newSearchDescriptor = { foo: 'bar', seqID: 'seq1234' };

    result.props.onSearchDescriptorChange(newSearchDescriptor);

    const newResult = shallowRenderer.getRenderOutput();

    newResult.props.searchDescriptor.should.equal(newSearchDescriptor);
  });

  it('should rerender with a new search descriptor when a new csid is supplied via props', function test() {
    const config = {};
    const recordType = 'object';
    const csid = '1234';

    const shallowRenderer = createRenderer();

    shallowRenderer.render(
      <TermsUsedPanel
        config={config}
        csid={csid}
        recordData={recordData}
        recordType={recordType}
      />);

    const result = shallowRenderer.getRenderOutput();

    result.props.searchDescriptor.should.have.property('csid', csid);

    const newCsid = '5678';

    shallowRenderer.render(
      <TermsUsedPanel
        config={config}
        csid={newCsid}
        recordData={recordData}
        recordType={recordType}
      />);

    const newResult = shallowRenderer.getRenderOutput();

    newResult.props.searchDescriptor.should.have.property('csid', newCsid);
  });

  it('should retain the same page number and page size when only the last updated timestamp is changed', function test() {
    const config = {};
    const recordType = 'object';
    const csid = '1234';

    const shallowRenderer = createRenderer();

    shallowRenderer.render(
      <TermsUsedPanel
        config={config}
        csid={csid}
        recordData={recordData}
        recordType={recordType}
      />);

    const result = shallowRenderer.getRenderOutput();
    const searchDescriptor = result.props.searchDescriptor;

    // Change the page num and size

    const changedPageSearchDescriptor = merge({}, searchDescriptor, {
      searchQuery: {
        p: 3,
        size: 7,
      },
    });

    result.props.onSearchDescriptorChange(changedPageSearchDescriptor);

    const newRecordData = Immutable.fromJS({
      document: {
        'ns2:collectionspace_core': {
          updatedAt: 'new updated at',
        },
      },
    });

    shallowRenderer.render(
      <TermsUsedPanel
        config={config}
        csid={csid}
        recordData={newRecordData}
        recordType={recordType}
      />);

    const newResult = shallowRenderer.getRenderOutput();
    const newSearchDescriptor = newResult.props.searchDescriptor;

    newSearchDescriptor.seqID.should.equal('new updated at');
    newSearchDescriptor.searchQuery.p.should.equal(3);
    newSearchDescriptor.searchQuery.size.should.equal(7);
  });
});