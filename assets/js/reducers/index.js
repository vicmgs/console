import merge from 'lodash/mergeWith'
import isArray from 'lodash/isArray'
import union from 'lodash/union'
import auth from './auth';
import user from './user';
import { SWITCHED_TEAM } from '../actions/team'
import { DELETED_ENTITY } from '../actions/main'

const defaultEntityState = {
  devices: {},
  events: {},
  gateways: {},
  channels: {},
  teams: {},
  memberships: {},
  invitations: {},
}

const entities = (state = defaultEntityState, action) => {
  // Updates an entity cache in response to any action with entities.
  if (action.entities) {
    return merge({}, state, action.entities, (objValue, srcValue) => {
      if (isArray(objValue)) return union(objValue, srcValue) //NOTE does not deep compare objects
    })
  }

  // Clears entity cache upon switching teams
  if (action.type === SWITCHED_TEAM) {
    return merge({}, defaultEntityState, {teams: state.teams})
  }

  // Handles deleting an entity
  if (action.type === DELETED_ENTITY) {
    let stateCopy = Object.assign({}, state)
    delete stateCopy[action.entity][action.id]
    return stateCopy
  }

  return state
}

const reducers = {
  entities,
  auth,
  user,
};

export default reducers;
