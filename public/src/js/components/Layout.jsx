import React from "react";
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import CustomTable from "./CustomTable.jsx";
import NewTable from "./NewTable.jsx";

export default class Layout extends React.Component {
  render () {
    return (
      <div>
        <Grid fluid={true}>
          <Row>
            <Col sm={12}>
              <CustomTable/>
            </Col>

          </Row>
        </Grid>
        <Grid fluid={true}>
          <Row>
            <Col sm={6}>
              <NewTable/>
            </Col>
            <Col sm={6}>
              <NewTable/>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
