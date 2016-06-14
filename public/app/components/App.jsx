import React from 'react';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import NewTable from './NewTable.jsx';
const baseUrl = 'http://localhost:3000';
export default class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return(
      <div>
        <Grid fluid={true}>
          <Row>
            <Col sm={6}>
              <NewTable title={'Images'} getUrl={baseUrl+'/v1/images'}/>
            </Col>
            <Col sm={6}>
              <NewTable title={'Instances'} getUrl={baseUrl+'/v1/instances'}/>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
