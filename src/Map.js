import { useState, useEffect, useRef } from 'react'
import Modal from 'react-modal';
import { MapContainer, TileLayer, CircleMarker, Pane } from 'react-leaflet'
import "leaflet.heat"
import { compareDesc, parse, format } from 'date-fns'

import HeatMapLayer from "./components/HeatMapLayer"
import Calendar from "./components/Calendar"
import Drop from "./components/Drop"
import { CalendarIcon, UploadIcon, RefreshIcon, MarkerIcon } from "./components/Icon"

import './styles/Map.css';
import 'leaflet/dist/leaflet.css'

Modal.setAppElement('#root');

function Map() {
    const [map, setMap] = useState(null)

    const [geojsonData, setGeojsonData] = useState([]) // store original data

    const [fLocationData, setFLocationData] = useState([]) // selected data

    const [fGeoData, setFGeoData] = useState([]) // selected data

    const [isModalOpen, setModalOpen] = useState(false)

    const [isCalendarOpen, setCalendarOpen] = useState(false)

    const [isDropOpen, setDropOpen] = useState(false)

    const [modalDatetime, setModalDatetime] = useState("1970-01-01 00:00:00")

    const [modalLocation, setModalLocation] = useState("")

    const [modalLocationName, setModalLocationName] = useState({name: "Loading City", state: "State", country: "XX"})

    const [dateRange, setDateRange] = useState(null)

    const [isMarkerShown, setMarkerShown] = useState(false)

    const position = [51.509865, -0.118092] // London lat lon

    const paneRef = useRef(null)

    useEffect(() => {
        getData()
    }, [map])

    useEffect(() => {
        filterData(geojsonData, dateRange)
    }, [dateRange])

    const markerList = fGeoData.map((feature) => {
        return <CircleMarker key={Math.random()} center={feature.geometry.coordinates} color={isMarkerShown?"#ff4d4d":"transparent"} weight="1" radius="5"
            eventHandlers={{
                click: () => {
                    setModalOpen(true);
                    setModalDatetime(feature.properties.datetime)
                    setModalLocation(feature.geometry.coordinates)
                    getLocationName(feature.geometry.coordinates[0], feature.geometry.coordinates[1])
                },
            }}>
		</CircleMarker>
    })

    function getData(){
        fetch("data/Geo.json")
        .then(function(response){
            return response.json()
        })
        .then(function(data) {
            setGeojsonData(data)       
            filterData(data)
        })
        .catch(function() {
            setDropOpen(true)
        })
    }

    function filterData(geojson, dateRange){
        if(!dateRange){
            const locations = geojson.map((feature) => {
                return feature.geometry.coordinates
            })
            setFLocationData(locations)
            setFGeoData(geojson)
        } else {
            const selectedData = geojsonData.filter(feature => {
                const date = parse(feature.properties.datetime, "yyyy-MM-dd HH:mm:ss", new Date())
                return compareDesc(dateRange.from, date) === 1 && compareDesc(date, dateRange.to) === 1
            })
            setFGeoData(selectedData)

            const locations = selectedData.map((feature) => {
                return feature.geometry.coordinates
            })
            setFLocationData(locations)
        }
    }

    function getLocationName(lat, lon) {
        fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=b9aea1648a32f0de205872f319a2567c`)
        .then(function(response){
            return response.json()
        })
        .then(function(data) {
            setModalLocationName({
                name: data[0].name, 
                state: data[0].state, 
                country: data[0].country
            })
        })
        .catch(function() {
            
        })
    }

    function closeAllModal() {
        setModalOpen(false)
        setCalendarOpen(false)
        setDropOpen(false)
    }

    function reposition() {
        map.fitBounds(fLocationData)
    }

	return (
		<div>
            <MapContainer id="map" center={position} zoom={13} scrollWheelZoom={true} zoomControl={false} ref={setMap}>
                <div className="tootip-overlay">
                    <RefreshIcon onClick={reposition} />
                    <CalendarIcon isOpen={isCalendarOpen} onClick={() => {closeAllModal("setCalendarOpen"); setCalendarOpen(!isCalendarOpen)}} />
                    <UploadIcon isOpen={isDropOpen} onClick={() => {closeAllModal("setCalendarOpen"); setDropOpen(!isDropOpen)}} />
                    <MarkerIcon isMarkerShown={isMarkerShown} onClick={() => setMarkerShown(!isMarkerShown)} />
                </div>
                <TileLayer attribution='&copy; <a href="https://github.com/rtkCode/CityTrace">CityTrace</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                />
                <HeatMapLayer locations={fLocationData} />
                <Pane ref={paneRef} name="markers">
                    { markerList }
                </Pane>
			</MapContainer>

            <Modal
                closeTimeoutMS={150}
                isOpen={isDropOpen}
                onRequestClose={() => setDropOpen(false)}
                contentLabel="drop"
                className="calendar-modal"
                overlayClassName="calendar-modal-overlay"
            >   
                <Drop setDropOpen={setDropOpen} setGeojsonData={setGeojsonData} filterData={filterData} />
            </Modal>

            <Modal
                closeTimeoutMS={150}
                isOpen={isModalOpen}
                onRequestClose={() => setModalOpen(false)}
                contentLabel="modal"
                className="common-modal"
                overlayClassName="common-modal-overlay"
            >
                <div className="details">
                    <div className="details-location">
                        <div className="details-title">
                            {modalLocationName.name}<small>, {modalLocationName.state}</small>
                        </div>
                        <div className="details-country">{modalLocationName.country}</div>
                    </div>
                    <div className="details-item">
                        {format(parse(modalDatetime, "yyyy-MM-dd HH:mm:ss", new Date()), 'PPP')}
                    </div>
                    <div className="details-item">
                        You used to visit here at <span>{format(parse(modalDatetime, "yyyy-MM-dd HH:mm:ss", new Date()), 'p')}</span>
                    </div>
                </div>
                
                
            </Modal>

            <Modal
                closeTimeoutMS={150}
                isOpen={isCalendarOpen}
                onRequestClose={() => setCalendarOpen(false)}
                contentLabel="calendar"
                className="calendar-modal"
                overlayClassName="calendar-modal-overlay"
            >   
                <Calendar dateRange={dateRange} setDateRange={setDateRange} setCalendarOpen={setCalendarOpen} />
            </Modal>
		</div>
	);
}

export default Map;