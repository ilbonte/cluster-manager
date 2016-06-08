import React from "react";

class Header extends React.Component {
  render () {

    const { props: { title } } = this
    return (
      <div>
        <h1>
          {title}
        </h1>
        <input value={this.props.title} onChange={this.handleChange.bind(this)} />
      </div>
    );
  }
  handleChange(e){
    this.props.changeTitle(e.target.value);
  }
}

export default Header;
