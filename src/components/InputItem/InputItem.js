import React, { Component } from "react";
import { Button, Container } from "reactstrap";
import TextField from "@material-ui/core/TextField";
import { Redirect } from "react-router-dom";
import TodoList from "../TodoList/TodoList";
import "./style.css";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import EditTodo from "../EditTodo/EditTodo";
import { ActionCableConsumer } from "react-actioncable-provider";
import ActionCable from 'actioncable';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#F2AA4CFF",
    },
  },
});

export default class InputItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      taskData: {
        title: "",
        description: "",
        status: "",
      },
      showTaskData: [],
      successAlertMsg: "",
      todoDeleteMsg: "",
      editTaskDataModal: false,
      editTaskData: {
        title: "",
        description: "",
      },
      successTodoUpdatedMsg: "",
    };
  }
  componentDidMount() {
    this.getTaskData();
  }

  addItem = () => {
    let token = sessionStorage.getItem("token");
    var requestOptions = {
      method: "POST",
      body: JSON.stringify({"title": this.state.taskData.title, "desc": this.state.taskData.description}),
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    };
    fetch("http://localhost:5000/todo", requestOptions)
      .then((response) => response)
      .then((result) => {
        // r = result.clone().json()
        if (result.status === 201) {
          
          this.setState({ successAlertMsg: "Added" }, () =>
            // this.getTaskData()
            console.log("pass")
          );
          setTimeout(() => {
            this.setState({ successAlertMsg: "" });
          }, 1000);
        }
        if (result.status === 422) {
          this.setState({
            taskData: {
              title: "",
              description: "",
            },
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  getTaskData() {
    let token = sessionStorage.getItem("token");
    var requestOptions = {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    };
    fetch("http://localhost:5000/todo", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result) {
          this.setState({
            showTaskData: result,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  onChangehandler = (e) => {
    const { taskData } = this.state;
    taskData[e.target.name] = e.target.value;
    this.setState({ taskData });
  };
  clearList = () => {
    this.setState({
      showTaskData: [],
    });
  };
  handleDelete = (id) => {
    let token = sessionStorage.getItem("token");
    var requestOptions = {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    };
    fetch(
      "http://localhost:5000/todo/" + id,
      requestOptions
    )
      .then((response) => response)
      .then((result) => {
        if (result.status === 204) {
          this.setState(
            {
              todoDeleteMsg: "Deleted",
            },
            () => this.getTaskData()
          );
          setTimeout(() => {
            this.setState({ todoDeleteMsg: "" });
          }, 1000);
        }
      });
  };
  toggleEditTaskModal = () => {
    this.setState({
      editTaskDataModal: !this.state.editTaskDataModal,
    });
  };
  onChangeEditTodoHandler = (e) => {
    let { editTaskData } = this.state;
    editTaskData[e.target.name] = e.target.value;
    this.setState({ editTaskData });
  };

  editTodo = (id, title, description) => {
    this.setState({
      editTaskData: { id, title, description },
      editTaskDataModal: !this.state.editTaskDataModal,
    });
  };

  handleReceivedTodo = response => {
    if (response.data) {
      console.log(response.data)
      this.setState({
        showTaskData: [...this.state.showTaskData, response.data],
      });
      
    }
    if (response.csv_url){
      console.log(response.csv_url)
    }
  }

  exportCSV = response => {
    console.log(response.csv_url)
  };

  exportCSVTrigger = () => {
    let token = sessionStorage.getItem("token");
    var requestOptions = {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    };
    fetch(
      "http://localhost:5000/export",
      requestOptions
    )
      .then((response) => response)
      .then((result) => {
        if (result.status === 204) {
          console.log("Fetching Data");
        }
      });
  };
  updateTodo = () => {
    let { id, title, description } = this.state.editTaskData;
    let token = sessionStorage.getItem("token");

    var requestOptions = {
      method: "PATCH",
      body: JSON.stringify({"title": title, "desc": description}),
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    };

    fetch(
      "http://localhost:5000/todo/" + id,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => {
        if (result.status === "success") {
          this.setState(
            {
              editTaskDataModal: false,
              editTaskData: { title, description },
            },
            () => this.getTaskData()
          );
          setTimeout(() => {
            this.setState({ editTaskDataModal: false });
          }, 1000);
        }
        if (result.error) {
          this.setState({
            successTodoUpdatedMsg: result.error,
          });
        }
      })
      .catch((error) => console.log("error", error));
  };
  render() {
    const { title, description } = this.state.taskData;
    if (this.state.isLoggedIn === false) {
      return <Redirect to="/log-in" />;
    }
    return (
      <Container className="themed-container mt-5" fluid="sm">
        <div className="input-field-container">
          <ThemeProvider theme={theme}>
            <TextField
              type="text"
              name="title"
              placeholder="Task Title"
              value={title}
              onChange={this.onChangehandler}
              color="primary"
              variant="outlined"
            />
            <TextField
              type="text"
              name="description"
              placeholder="Task description"
              value={description}
              onChange={this.onChangehandler}
              color="primary"
              variant="outlined"
              style={{ width: "50%" }}
            />
            <Button
              color="success"
              className="font-weight-bold add-task"
              onClick={this.addItem}
            >
              +
            </Button>
            <Button
              className="font-weight-bold"
              onClick={this.exportCSVTrigger}
            >
              Export
            </Button>
          </ThemeProvider>
        </div>
        <div class="text-success p-4 mt-2">{this.state.successAlertMsg}</div>
        {/*TODO list  */}
       <ActionCableConsumer channel={{channel: 'TodoUnitsChannel'}} onReceived = {this.handleReceivedTodo}/>
        {/*<ActionCableConsumer channel={{channel: 'ExportChannel'}} onReceived = {this.exportCSV}/>*/}
        <TodoList
          showTaskData={this.state.showTaskData}
          clearList={this.clearList}
          handleDelete={this.handleDelete}
          todoDeleteMsg={this.state.todoDeleteMsg}
          editTodo={this.editTodo}
          toggleEditTaskModal={this.toggleEditTaskModal}
        />
        {/* Model for Edit Todo */}
        <EditTodo
          toggleEditTaskModal={this.toggleEditTaskModal}
          editTaskDataModal={this.state.editTaskDataModal}
          onChangeEditTodoHandler={this.onChangeEditTodoHandler}
          editTodo={this.editTodo}
          editTaskData={this.state.editTaskData}
          updateTodo={this.updateTodo}
          successTodoUpdatedMsg={this.state.successTodoUpdatedMsg}
        />
      </Container>
    );
  }
}