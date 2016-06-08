import React from "react";
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Collapse from 'react-bootstrap/lib/Collapse';

class CustomTable extends React.Component {

    render() {
        let myData = [
            {
                name: "Alex",
                surname: "Rossi",
                age: 43,
                born: "Trento",
                info: " I wish I had better word, i don't care what you think...Random text or also better:  I wish i found some chords thatare in order"
            }, {
                name: "Luca",
                surname: "Verdi",
                age: 20,
                born: "cles",
                info: "Random text or also better: I wish I had better word, I wish i found some chords thatare in order"
            }
        ];
        return (
            <div>
                <TableHeader/>
                <TableBody data={myData}/>
            </div>
        );
    }

}

class TableHeader extends React.Component {
    render() {

        const {props: {
                title
            }} = this
        return (
            <Grid>
                <Row>
                    <Col xs={3}>
                        <h2>Header 1</h2>
                    </Col>
                    <Col xs={3}>
                        <h2>Header 2</h2>
                    </Col>
                    <Col xs={3}>
                        <h2>Header 3</h2>
                    </Col>
                    <Col xs={3}>
                        <h2>Header 4</h2>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

class TableBody extends React.Component {
    render() {
        var crowNodes = this.props.data.map((item) => {
            let {name, surname, age, born, info} = item;
            console.log(name);
            return (<CRow name={name} surname={surname} age={age} born={born} info={info} key={name}/>);
        });

        return (<div>{crowNodes}</div>);

    }
}

class CRow extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {

        return (
            <Grid>
                <Row onClick={() => this.setState({
                    open: !this.state.open
                })}>
                    <Col xs={3}>{this.props.name}</Col>
                    <Col xs={3}>{this.props.surname}</Col>
                    <Col xs={3}>{this.props.age}</Col>
                    <Col xs={3}>{this.props.born}</Col>
                </Row>
                <Row>
                    <Collapse in={this.state.open}>
                        <div>
                            <p>
                                {this.props.info}

                            </p>
                        </div>
                    </Collapse>
                </Row>
            </Grid>
        );
    }
}

export default CustomTable;
