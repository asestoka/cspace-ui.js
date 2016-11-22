import Immutable from 'immutable';
import chaiImmutable from 'chai-immutable';

import {
  ADD_TERM_STARTED,
  ADD_TERM_FULFILLED,
  ADD_TERM_REJECTED,
  PARTIAL_TERM_SEARCH_STARTED,
  PARTIAL_TERM_SEARCH_FULFILLED,
  PARTIAL_TERM_SEARCH_REJECTED,
  CLEAR_PARTIAL_TERM_SEARCH_RESULTS,
} from '../../../src/actions/partialTermSearch';

import reducer, {
  getMatches,
} from '../../../src/reducers/partialTermSearch';

chai.use(chaiImmutable);
chai.should();

describe('partialTermSearch reducer', function suite() {
  const authorityServiceName = 'personauthorities';
  const vocabularyName = 'person';
  const displayName = 'abcd';
  const partialTerm = 'zyxw';

  it('should have an empty Immutable initial state', function test() {
    reducer(undefined, {}).should.equal(Immutable.Map({}));
  });

  it('should handle ADD_TERM_STARTED', function test() {
    reducer(Immutable.Map(), {
      type: ADD_TERM_STARTED,
      meta: {
        displayName,
        authorityServiceName,
        vocabularyName,
      },
    }).should.equal(Immutable.fromJS({
      [displayName]: {
        [authorityServiceName]: {
          [vocabularyName]: {
            isAddPending: true,
          },
        },
      },
    }));
  });

  it('should handle ADD_TERM_FULFILLED', function test() {
    const newTermData = {};

    const addTermResponse = {
      data: newTermData,
    };

    reducer(Immutable.Map(), {
      type: ADD_TERM_FULFILLED,
      payload: addTermResponse,
      meta: {
        displayName,
        authorityServiceName,
        vocabularyName,
      },
    }).should.equal(Immutable.fromJS({
      [displayName]: {
        [authorityServiceName]: {
          [vocabularyName]: {
            newTerm: newTermData,
          },
        },
      },
    }));
  });

  it('should handle ADD_TERM_REJECTED', function test() {
    const error = new Error();

    reducer(Immutable.Map(), {
      type: ADD_TERM_REJECTED,
      payload: error,
      meta: {
        displayName,
        authorityServiceName,
        vocabularyName,
      },
    }).should.equal(Immutable.fromJS({
      [displayName]: {
        [authorityServiceName]: {
          [vocabularyName]: {
            error,
          },
        },
      },
    }));
  });

  it('should handle PARTIAL_TERM_SEARCH_STARTED', function test() {
    reducer(Immutable.Map(), {
      type: PARTIAL_TERM_SEARCH_STARTED,
      meta: {
        partialTerm,
        authorityServiceName,
        vocabularyName,
      },
    }).should.equal(Immutable.fromJS({
      [partialTerm]: {
        [authorityServiceName]: {
          [vocabularyName]: {
            isSearchPending: true,
          },
        },
      },
    }));
  });

  it('should handle PARTIAL_TERM_SEARCH_FULFILLED', function test() {
    const items = [
      { refName: 'a' },
      { refName: 'b' },
    ];

    const searchData = {
      'ns2:abstract-common-list': {
        itemsInPage: '2',
        'list-item': items,
      },
    };

    const searchResponse = {
      data: searchData,
    };

    const newState = reducer(Immutable.Map(), {
      type: PARTIAL_TERM_SEARCH_FULFILLED,
      payload: searchResponse,
      meta: {
        partialTerm,
        authorityServiceName,
        vocabularyName,
      },
    });

    newState.getIn([partialTerm, authorityServiceName, vocabularyName, 'items']).should.deep.equal(items);

    getMatches(newState).should.equal(newState);
  });

  it('should set items to empty array if search result count is zero', function test() {
    const searchData = {
      'ns2:abstract-common-list': {
        itemsInPage: '0',
      },
    };

    const searchResponse = {
      data: searchData,
    };

    const newState = reducer(Immutable.Map(), {
      type: PARTIAL_TERM_SEARCH_FULFILLED,
      payload: searchResponse,
      meta: {
        partialTerm,
        authorityServiceName,
        vocabularyName,
      },
    });

    newState.getIn([partialTerm, authorityServiceName, vocabularyName, 'items']).should
      .deep.equal([]);

    getMatches(newState).should.equal(newState);
  });

  it('should set items to an array if one list item is returned', function test() {
    const items = { refName: 'a' };

    const searchData = {
      'ns2:abstract-common-list': {
        itemsInPage: '1',
        'list-item': items,
      },
    };

    const searchResponse = {
      data: searchData,
    };

    const newState = reducer(Immutable.Map(), {
      type: PARTIAL_TERM_SEARCH_FULFILLED,
      payload: searchResponse,
      meta: {
        partialTerm,
        authorityServiceName,
        vocabularyName,
      },
    });

    newState.getIn([partialTerm, authorityServiceName, vocabularyName, 'items']).should
      .deep.equal([items]);

    getMatches(newState).should.equal(newState);
  });

  it('should handle PARTIAL_TERM_SEARCH_REJECTED', function test() {
    const error = new Error();

    const newState = reducer(Immutable.Map(), {
      type: PARTIAL_TERM_SEARCH_REJECTED,
      payload: error,
      meta: {
        partialTerm,
        authorityServiceName,
        vocabularyName,
      },
    });

    newState.getIn([partialTerm, authorityServiceName, vocabularyName, 'error']).should.deep.equal(error);
  });

  it('should handle CLEAR_PARTIAL_TERM_SEARCH_RESULTS', function test() {
    reducer(Immutable.fromJS({
      [partialTerm]: {
        [authorityServiceName]: {
          [vocabularyName]: {
            isSearchPending: true,
          },
        },
      },
    }), {
      type: CLEAR_PARTIAL_TERM_SEARCH_RESULTS,
    }).should.equal(Immutable.Map({}));
  });
});
