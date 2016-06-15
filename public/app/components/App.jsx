import React from 'react';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import NewTable from './NewTable.jsx';

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
              <NewTable title={'Images'} getUrl={'/v1/images'}/>
            </Col>
            <Col sm={6}>
              <NewTable title={'Instances'} getUrl={'/v1/instances'}/>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}
