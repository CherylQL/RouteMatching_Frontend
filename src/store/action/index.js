export const addcarPoint = carPoint => ({
  type: 'ADD_CAR_POINT',
  point: {
    create_time: carPoint.create_time,
    cid: carPoint.cid,
    lon: carPoint.lon,
    lat: carPoint.lat,
  }
})
