import React, { Component } from 'react'

class Audio extends Component {
	constructor(props){
		super( props )

		this.audioRef = React.createRef()

		this.updateSrc = this.updateSrc.bind(this)
		this.playClick = this.playClick.bind(this)
		this.setTime = this.setTime.bind(this)
		this.handleEnd = this.handleEnd.bind(this)
		this.updateBar = this.updateBar.bind(this)
		this.download = this.download.bind(this)
		this.state = {
			play:false,
			progress:0
		}
		this.updateSrc(true)
		setInterval(this.updateBar,300)
	}
	updateBar(){
		if (this.audioRef.current) {
			this.setState({
				progress : (this.audioRef.current.currentTime*100)/this.audioRef.current.duration
			})
		}
	}
	updateSrc(isFirstCall,np){
		const props = np ? np : this.props
		if ( props.src ) {
			if (/\.mp3$/.test(props.src)) {//simple file
				fetch(props.src)
				.then((response) => {
					if(response.ok) {
						return response.blob()
					}
					throw new Error('Network error.')
				})
				.then((myBlob) => {
					var objectURL = URL.createObjectURL(myBlob)
					this.setState({ src: objectURL })
				})
				.catch((error) => {
					console.log('There has been a problem with your fetch operation: ', error.message)
				})
			} else {//file in the holochain, this should be a hash
				fetch('/fn/podcast/getAudio',{
					method : 'POST',
					body : props.src ? props.src : ''
				})
				.then((response) => {
					if(response.ok) {
						return response.blob()
					}
					throw new Error('Network error.')
				})
				.then((myBlob) => {
					var objectURL = URL.createObjectURL(myBlob)
					this.setState({ src: objectURL })
				})
				.catch((error) => {
					console.log('There has been a problem with your fetch operation: ', error.message)
				})
			}
		}
	}
	downloadBlob(blob){
        let a = document.createElement('a')
        a.href = window.URL.createObjectURL(blob)
        a.download = "track.mp3"
        a.click()
	}
	download(){
		let props = this.props
		if ( props.src ) {
			if (/\.mp3$/.test(this.props.src)) {//simple file
				fetch(props.src)
				.then((response) => {
					if(response.ok) {
						return response.blob()
					}
					throw new Error('Network error.')
				})
				.then((myBlob) => {
					this.downloadBlob(myBlob)
				})
				.catch((error) => {
					console.log('There has been a problem with your fetch operation: ', error.message)
				})
			} else {//file in the holochain, this should be a hash
				fetch('/fn/podcast/getAudio',{
					method : 'POST',
					body : props.src ? props.src : ''
				})
				.then((response) => {
					if(response.ok) {
						return response.blob()
					}
					throw new Error('Network error.')
				})
				.then((myBlob) => {
					this.downloadBlob(myBlob)
				})
				.catch((error) => {
					console.log('There has been a problem with your fetch operation: ', error.message)
				})
			}
		}
	}
	componentWillReceiveProps(np,op){
		this.updateSrc(false,np)
	}
	playClick(e){
		e.preventDefault()
		if (this.state.play) {
			this.audioRef.current.pause()
		} else {
			this.audioRef.current.play()
		}
		this.setState({play:!this.state.play})
	}
	handleEnd(e){
		this.setState({play:false})
	}
	setTime(e){
		e.preventDefault()
		const iw = window.innerWidth
		let barWidth = iw - 150
		barWidth -= barWidth * 0.025
		let clickWidth = e.clientX - 50 - barWidth * 0.0125
		let proportion = clickWidth / barWidth
		//this.setState({progress : ( clickWidth *100 ) / barWidth })
		this.audioRef.current.currentTime = proportion * this.audioRef.current.duration

	}
	render() {
		return (
			<section id="audio-container">
				<audio onEnded={this.handleEnd} ref={this.audioRef} style={{display:'none'}} src={this.state.src}></audio>
				<span
					id="play"
					onClick={this.playClick}
					className={this.state.play?'pause':''}
					title={this.state.play?'pause':'play'}
					>
				</span>
				<div id="progress-bar">
					<div id="progress-container" onClick={this.setTime}>
						<div id="progress" style={{width:this.state.progress+'%'}} />
					</div>
				</div>
				<span id="volume" title="volume" style={{borderLeft:'1px solid #222'}}>
					<div className="volume-progress-bar">
						<div className="volume-progress">
							
						</div>
					</div>
				</span>
				<span id='download' title="download" onClick={this.download}>
					<small/>
				</span>
			</section>
		)
	}
}

export default Audio;