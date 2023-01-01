import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

import L from 'leaflet'
import "leaflet.heat"

function HeatMapLayer(props) {
	const map = useMap()
	let layer = null

	useEffect(() => {
		const points = props.locations
        layer = L.heatLayer(points, {
			// radius: 10,
			// max: 20
		}).addTo(map)

		return () => {
            if(layer != null) map.removeLayer(layer)
        }
	}, [props.locations]);

	return (
		<div></div>
	);
}

export default HeatMapLayer;