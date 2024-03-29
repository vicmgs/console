import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { resendVerification, hasResetCaptcha } from '../../actions/auth.js';
import config from '../../config/common.js';
import Recaptcha from './Recaptcha.jsx';
import AuthLayout from '../common/AuthLayout'

// MUI
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import { withStyles } from 'material-ui/styles';

const styles = theme => ({
  title: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
  formButton: {
    marginTop: theme.spacing.unit * 2,
  },
  extraLinks: {
    marginTop: theme.spacing.unit * 2,
    textAlign: 'center'
  }
});

class ResendVerification extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      recaptcha: ""
    };

    this.handleInputUpdate = this.handleInputUpdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.verifyRecaptcha = this.verifyRecaptcha.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.shouldResetCaptcha) {
      this.recaptchaInstance.reset()
      this.props.hasResetCaptcha()
    }
  }

  handleInputUpdate(e) {
    this.setState({ [e.target.name]: e.target.value})
  }

  handleSubmit(e) {
    e.preventDefault();
    const { email, recaptcha } = this.state;

    this.props.resendVerification(email, recaptcha);
  }

  verifyRecaptcha(recaptcha) {
    this.setState({ recaptcha })
  }

  render() {
    const { classes } = this.props

    return(
      <AuthLayout>
        <Card>
          <CardContent>
            <Typography variant="headline" className={classes.title}>
              Resend My Verification Email
            </Typography>

            <form onSubmit={this.handleSubmit}>

              <TextField
                type="email"
                label="Email"
                name="email"
                value={this.state.email}
                onChange={this.handleInputUpdate}
                fullWidth
                style={{marginBottom: 16}}
              />

              <Recaptcha
                ref={e => this.recaptchaInstance = e}
                sitekey={config.recaptcha.sitekey}
                verifyCallback={this.verifyRecaptcha}
              />

              <Button
                type="submit"
                variant="raised"
                color="primary"
                size="large"
                className={classes.formButton}
              >
                Send Email
              </Button>
            </form>
          </CardContent>
        </Card>

        <Typography component="p" className={classes.extraLinks}>
          <Link to="/login">
            Login page
          </Link>
        </Typography>
      </AuthLayout>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ resendVerification, hasResetCaptcha }, dispatch);
}

const styled = withStyles(styles)(ResendVerification)
export default connect(mapStateToProps, mapDispatchToProps)(styled);
