import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { Container } from "reactstrap";
import { Link } from "react-router-dom";
import "./LoginStyle.css";
import showPwd from "../../images/showPwd.png";
import hidePwd from "../../images/hidePwd.png";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { Redirect } from "react-router-dom";
import jwt_decode from "jwt-decode";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#F2AA4CFF",
    },
  },
});

export default class Login extends Component {
  state = {
    loginData:{
      email: "",
      password: "",
    },
    errMsgEmail:'',
    errMsgPassword:'',
    hidden: true,
    redirect:false,
    errMsg:'',
    accessToken: "",
    user_id: "",
    error:false
  };

  toggleShow = () => {
    this.setState({ hidden: !this.state.hidden });
  };

  onChangeHandler = (e) =>{
    const {loginData} = this.state;
    loginData[e.target.name] = e.target.value;
     this.setState({loginData});
  }

  onSubmitHandler = () =>{
    var formdata = new FormData();
    formdata.append("email", this.state.loginData.email);
    formdata.append("password", this.state.loginData.password);

    var requestOptions = {
      method: "POST",
      body: formdata,
    };
    fetch(
      "http://localhost:5000/login",
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if(result.status === 'success'){
          this.setState({accessToken:result.token, user_id: jwt_decode(result.token).user_id})
          sessionStorage.setItem('token', this.state.accessToken)
          sessionStorage.setItem('user_id', this.state.user_id)
          sessionStorage.setItem('isLoggedIn', true)
        }
    if(result.status === 'failed'){
      this.setState({
        errMsg:result.error
      })
    }
    if(result.status === "failed"){
      this.setState({
        error:true,
        errMsgEmail:result.error,
        errMsgPassword:result.error
      })
    }
    if(result.token){
      this.setState({ redirect:true })
    }
      })
      .catch((error) => {
        console.log("error",error);
      });  
  }

  render() {
   const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (this.state.redirect ) {
      return <Redirect to="/todo" />;
    }
    if(isLoggedIn){
      return <Redirect to="/todo" />;
    }
    return (
      <Container className="themed-container mt-2" fluid="sm">
        <ThemeProvider theme={theme}>
        <div className="wrapper">
          <div className="text-center">
            <i className="fa fa-user-circle-o" aria-hidden="true"></i>
            <div className="text-color">Signin</div>
            <div className="hr"></div>
          </div>
          <div className="signin-wrapper">  
              <TextField
                error={this.state.error}
                helperText={this.state.loginData.email === ''? this.state.error : this.state.errMsgEmail}
                label="Email"
                type="text"
                name="email"
                fullWidth
                variant="outlined"
                value={this.state.loginData.email}
                onChange={this.onChangeHandler}
              />
              <div className="show-hide-pwd-wrapper">
                <TextField
                  error={this.state.error}
                  helperText={this.state.loginData.password ===''? this.state.error : this.state.errMsgPassword }
                  label="Password"
                  name="password"
                  type={this.state.hidden ? "password" : "text"}
                  fullWidth
                  variant="outlined"
                  value={this.state.loginData.password}
                  onChange={this.onChangeHandler}
                />

                <img
                  src={this.state.hidden ? showPwd : hidePwd}
                  onClick={this.toggleShow}
                  alt="showPwd"
                  className="eyeIcon"
                />
              </div>
              <p className="errMsgStyl">{this.state.errMsg}</p>
            <Button
              variant="contained"
              fullWidth
              color="primary"
              onClick={this.onSubmitHandler}
              disabled={!this.state.loginData.email || !this.state.loginData.password}
            >
              SIGN IN
            </Button>
            <p to="/sign-up" className="dont-have-txt">
              Don't have an Account to Signin? <Link to="/" className="signup-txt">SignUp</Link>
            </p>
          </div>
        </div>
        </ThemeProvider>
      </Container>
    );
  }
}