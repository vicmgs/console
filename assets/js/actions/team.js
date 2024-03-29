import { push } from 'react-router-redux';
import * as rest from '../util/rest';
import { getTeamId } from '../util/jwt';
import { normalizeTeam, normalizeTeams } from '../schemas/team'
import { receivedInvitation } from './invitation'
import { receivedMembership } from './membership'

export const FETCH_TEAMS = 'FETCH_TEAMS'
export const RECEIVED_TEAMS = 'RECEIVED_TEAMS'
export const FETCH_TEAM = 'FETCH_TEAM'
export const RECEIVED_TEAM = 'RECEIVED_TEAM'
export const SWITCHED_TEAM = 'SWITCHED_TEAM'

export const fetchTeams = () => {
  return (dispatch) => {
    rest.get('/api/teams')
      .then(response => {
        return dispatch(receivedTeams(response.data))
      })
  }
}

export const receivedTeams = (teams) => {
  const entities = normalizeTeams(teams)

  return {
    type: RECEIVED_TEAMS,
    entities
  }
}

export const fetchTeam = (id) => {
  return (dispatch) => {
    rest.get(`/api/teams/${id}`)
      .then(response => {
        return dispatch(receivedTeam(response.data))
      })
  }
}

export const receivedTeam = (team) => {
  const entities = normalizeTeam(team)

  return {
    type: RECEIVED_TEAM,
    entities
  }
}


export const createTeam = (name, afterSwitchPath) => {
  return (dispatch) => {
    rest.post('/api/teams', {
        team: {
          name
        }
      })
      .then(response => {
        dispatch(receivedTeam(response.data))
        dispatch(switchTeam(response.data.id, afterSwitchPath))
      })
  }
}

export const switchTeam = (id, afterSwitchPath) => {
  return (dispatch) => {
    rest.post(`/api/teams/${id}/switch`)
      .then(response => {
        dispatch(switchedTeam(response.data.jwt))

        if (afterSwitchPath) {
          dispatch(push(afterSwitchPath))
        }
      })
  }
}

export const switchedTeam = (apikey) => {
  return {
    type: SWITCHED_TEAM,
    apikey,
    currentTeamId: getTeamId(apikey)
  }
}

export const inviteUser = (invitation) => {
  return (dispatch) => {
    rest.post(`/api/invitations`, { invitation })
    .then(response => {})
  }
}
