import React, { Component } from 'react';
import Navigation from './navigation';
import Arrows from './arrows';

export default class Slider extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dragStart: 0,
            dragStartTime: new Date(),
            index: 0,
            lastIndex: 0,
            transition: false
        }
    }

    static defaultProps = {
        loop: false,
        selected: 0,
        showArrows: true,
        showNav: true
    };

    componentWillMount() {
        const { selected } = this.props;

        this.setState({
            index: selected,
            lastIndex: selected,
        });
    }

    componentWillReceiveProps(nextProps) {
        const { selected } = this.props;

        if (selected !== nextProps.selected) {
            this.goToSlide(nextProps.selected);
        }
    }

    getDragX(event, isTouch) {
        return isTouch ?
            event.touches[0].pageX :
            event.pageX;
    }

    handleDragStart(event, isTouch) {
        const x = this.getDragX(event, isTouch);

        this.setState({
            dragStart: x,
            dragStartTime: new Date(),
            transition: false,
            slideWidth: ReactDOM.findDOMNode(this.refs.slider).offsetWidth,
        });
    }

    handleDragMove(event, isTouch) {
        const {
            dragStart,
            lastIndex,
            slideWidth,
        } = this.state;

        const x = this.getDragX(event, isTouch);
        const offset = dragStart - x;
        const percentageOffset = offset / slideWidth;
        const newIndex = lastIndex + percentageOffset;
        const SCROLL_OFFSET_TO_STOP_SCROLL = 30;

        // Stop scrolling if you slide more than 30 pixels
        if (Math.abs(offset) > SCROLL_OFFSET_TO_STOP_SCROLL) {
            event.stopPropagation();
            event.preventDefault();
        }

        this.setState({
            index: newIndex,
        });
    }

    handleDragEnd() {
        const {
            children,
        } = this.props;
        const {
            dragStartTime,
            index,
            lastIndex,
        } = this.state;

        const timeElapsed = new Date().getTime() - dragStartTime.getTime();
        const offset = lastIndex - index;
        const velocity = Math.round(offset / timeElapsed * 10000);

        let newIndex = Math.round(index);

        if (Math.abs(velocity) > 5) {
            newIndex = velocity < 0 ? lastIndex + 1 : lastIndex - 1;
        }

        if (newIndex < 0) {
            newIndex = 0;
        } else if (newIndex >= children.length) {
            newIndex = children.length - 1;
        }

        this.setState({
            dragStart: 0,
            index: newIndex,
            lastIndex: newIndex,
            transition: true,
        });
    }

    goToSlide = (index, event) => {
        const {
            children,
            loop,
        } = this.props;

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (index < 0) {
            index = loop ? children.length - 1 : 0;
        } else if (index >= children.length) {
            index = loop ? 0 : children.length - 1;
        }

        this.setState({
            index: index,
            lastIndex: index,
            transition: true
        })
    };

    render() {
        const {
            children,
            showArrows,
            showNav,
        } = this.props;

        const {
            index,
            transition,
        } = this.state;


        const slidesStyles = {
            width: `${ 100 * children.length }%`,
            transform: `translateX(${ -1 * index * (100 / children.length) }%)`,
        };
        const slidesClasses = transition ? 'slider-slides slider-slides--transition' : 'slider-slides';

        return (
            <div className='slider' ref='slider'>
                { showArrows ? <Arrows {...this.props} lastIndex={this.state.lastIndex} onArrowsClick={this.goToSlide}/> : null }
                { showNav ? <Navigation {...this.props} lastIndex={this.state.lastIndex} onNavClick={this.goToSlide}/> : null }

                <div
                    className='slider-inner'
                    onTouchStart={ (event) => this.handleDragStart(event, true) }
                    onTouchMove={ (event) => this.handleDragMove(event, true) }
                    onTouchEnd={ () => this.handleDragEnd(true) }>
                    <div
                        className={ slidesClasses }
                        style={ slidesStyles }>
                        { children }
                    </div>
                </div>
            </div>
        );
    }
}