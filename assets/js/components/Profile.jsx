import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchUser } from '../actions/user.js';
import { logOut } from '../actions/auth';
import DashboardLayout from './common/DashboardLayout'

// MUI
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';

class Profile extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchUser();
  }

  render() {
    const { email } = this.props.user;
    const { logOut } = this.props

    return(
      <DashboardLayout title="Profile">
        <Card>
          <CardContent>
            <Typography variant="headline" component="h3">
              Profile Details
            </Typography>
            <Typography component="p">
              Your email is: {email}
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              color="secondary"
              onClick={() => logOut()}
            >
              Log Out
            </Button>
          </CardActions>
        </Card>
      </DashboardLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchUser, logOut }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
