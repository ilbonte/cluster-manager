import React from "react";
import Button from 'react-bootstrap/lib/Button';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Table from 'react-bootstrap/lib/Table';
import Tabs from 'react-bootstrap/lib/Tabs';
import Collapse from 'react-bootstrap/lib/Collapse';
import Well from 'react-bootstrap/lib/Well';
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import CustomTable from "./CustomTable.jsx";

export default class Layout extends React.Component {
  constructor(){
    super();

    this.state = {
      title: "Welcome!!!"
    };

  }

  changeTitle (title){
    this.setState({title});
  }

  render () {
    return (
      <div>
        <CustomTable/>
      </div>
    );
  }


}
