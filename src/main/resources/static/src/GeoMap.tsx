import React, {useLayoutEffect, useState} from 'react';
import {
  Typography,
  Box,
  Slider,
  Stack,
  TextField,
  Button,
  Tabs,
  Tab,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import {YMaps, Map, Placemark, GeoObject} from '@pbe/react-yandex-maps';

import CircleIcon from '@mui/icons-material/Circle';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import './styles/map.css';
import axios from "axios";
import Answer from "./Answer";
import ResultModel from "./ResultModel";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const {children, value, index, ...other} = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function valuetext(value: number) {
  return `${value}°C`;
}

interface State {
  "PSS": boolean,
  "GTNL1": boolean,
  "SVR": boolean,
  "MSI": boolean,
  "OLITIRS": boolean,
  "MSU101": boolean,
  "MSU102": boolean,
  "MSUTM101": boolean,
  "MSUTM102": boolean,
  "MSUMR": boolean
}

interface Ppoint {
  x: number,
  y: number
}

interface Point {
  coords: number[],
  key: number
}

export default function GeoMap() {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    function updateSize() {
      setHeight(window.innerHeight - 32);
    }

    window.addEventListener('resize', updateSize);
    updateSize();
  })

  const [value, setValue] = useState(0);

  const [dateTimeOt, setDateTimeOt] = useState<string>();
  const [dateTimeDo, setDateTimeDo] = useState<string>();
  const [sens, setSens] = useState<State>({
    "PSS": false,
    "GTNL1": false,
    "SVR": false,
    "MSI": false,
    "OLITIRS": false,
    "MSU101": false,
    "MSU102": false,
    "MSUTM101": false,
    "MSUTM102": false,
    "MSUMR": false
  });
  const [sliderValue, setSliderValue] = useState<number[]>([0, 30]);
  const [points, setPoints] = useState<Point[]>([]);
  const [coordsPoint, setCoordsPoint] = useState<number[][]>([]);
  const [isDot, setDot] = useState<boolean>(true);
  const [finds, setFinds] = useState<ResultModel[]>([]);

  const clearPoints = () => {
    setPoints([]);
    setCoordsPoint([]);
  }

  const addPoint = (p: Point) => {
    if (isDot) {
      setPoints([p]);
      setCoordsPoint([p.coords])
    } else {
      const tmp: Point[] = [];
      points.forEach((pp) => {
        tmp.push(pp);
      })
      tmp.push(p);
      setPoints(tmp);
      const tmpCords: number[][] = [];
      points.forEach((pp) => {
        tmpCords.push(pp.coords);
      })
      tmpCords.push(p.coords);
      setCoordsPoint(tmpCords)
    }
  }
  const removePoint = (key: number) => {
    let point: Point;
    points.forEach((p) => {
      if (p.key === key) point = p;
    })
    setCoordsPoint(coordsPoint.filter((cord) => cord[0] !== point.coords[0] && cord[1] !== point.coords[1]));
    setPoints(points.filter((p) => p.key !== key));
  }
  const dotGeometry = () => {
    clearPoints()
    setDot(true);
  }
  const polygonGeometry = () => {
    clearPoints();
    setDot(false);
  }
  const setSensor = (key: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSens({...sens, [key]: event.target.checked})
  }

  const handleChangeSlider = (event: Event, newValue: number | number[]) => {
    setSliderValue(newValue as number[]);
  };
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const onMapClick = (e: any) => {
    const r = e.get('coords');
    if (typeof r[0] !== 'number' || typeof r[1] !== 'number') return;
    addPoint({coords: r, key: +new Date()});
  }

  const fillSensors = () => {
    const sensors: string[] = [];
    if (sens.PSS) sensors.push("PSS");
    if (sens.GTNL1) sensors.push("GTNL1");
    if (sens.SVR) sensors.push("SVR");
    if (sens.MSI) sensors.push("MSI");
    if (sens.OLITIRS) sensors.push("OLITIRS");
    if (sens.MSU101) sensors.push("MSU101");
    if (sens.MSU102) sensors.push("MSU102");
    if (sens.MSUTM101) sensors.push("MSUTM101");
    if (sens.MSUTM102) sensors.push("MSUTM102");
    if (sens.MSUMR) sensors.push("MSUMR");
    return sensors;
  }
  const fillPoints = () => {
    const tmp:Ppoint[] = [];
    coordsPoint.forEach((p) => {
      tmp.push({x: p[1], y: p[0]})
    })
    return tmp;
  }
  const findImages = () => {
    setFinds([])
    if (dateTimeDo === undefined || dateTimeOt === undefined) {
      alert("Выберите дату");
      return;
    }
    const dateOt = dateTimeOt?.split("-");
    if (new Date(+dateOt[0], +(dateOt[1]) - 1, +dateOt[2]) > new Date()) {
      alert("Некоретно выбрана дата");
      return;
    }
    const dateDo = dateTimeDo?.split("-");
    if (new Date(+dateDo[0], +(dateDo[1]) - 1, +dateDo[2]) > new Date()) {
      alert("Некоретно выбрана дата");
      return;
    }
    if (new Date(+dateOt[0], +(dateOt[1]) - 1, +dateOt[2]) > new Date(+dateDo[0], +(dateDo[1]) - 1, +dateDo[2])) {
      alert("Некоретно выбрана дата");
      return;
    }
    if (coordsPoint.length === 0) {
      alert("Выберите область");
      return;
    }
    const sensors = fillSensors();
    if (sensors.length === 0){
      alert("Не выбран ни один спутник");
      return;
    }

    const points = fillPoints()

    const object = {
      date: [dateTimeOt+"T00:00:00Z", dateTimeDo+"T00:00:00Z"],
      cloud: sliderValue,
      angle: [0,90],
      sensors: sensors,
      geometry: {
        points: points,
        type: isDot ? "POINT" : "POLYGON"
      }
    }
    axios.post("http://localhost:8080/main", object).then((res) => {
      console.log(res.data)
      if (res.data.status){
        const answer : Answer = res.data.object;
        if (answer.count === 0){
          alert("Снимки не найдены");
          return;
        }
        setFinds(answer.results);
        setValue(1);
        return;
      }
      alert(res.data.error)
    }).catch((err) => {
      alert(err)
    })
  }

  const children = (
    <Box sx={{display: 'flex', flexDirection: 'column', ml: 3}}>
      <FormControlLabel
        label="сенсор МСУ-101" sx={{whiteSpace: 'nowrap'}}
        control={<Checkbox checked={sens.MSU101} onChange={setSensor("MSU101")}/>}
      />
      <FormControlLabel
        label="сенсор МСУ-102" sx={{whiteSpace: 'nowrap'}}
        control={<Checkbox checked={sens.MSU102} onChange={setSensor("MSU102")}/>}
      />
      <FormControlLabel
        label="сенсор МСУ-TM-101" sx={{whiteSpace: 'nowrap'}}
        control={<Checkbox checked={sens.MSUTM101} onChange={setSensor("MSUTM101")}/>}
      /><FormControlLabel
      label="сенсор МСУ-TM-102" sx={{whiteSpace: 'nowrap'}}
      control={<Checkbox checked={sens.MSUTM102} onChange={setSensor("MSUTM102")}/>}
    />
    </Box>
  );

  return (
    <Stack direction={'row'}>
      <Stack width='370px' spacing={2} height={height} padding={1} className={'section'}>
        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" centered>
            <Tab label="Поиск" {...a11yProps(0)}/>
            <Tab label="Выборка" {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Stack spacing={1}>
            <Typography variant="h6" align='center' sx={{whiteSpace: 'nowrap'}}>
              Интервал времени съёмки:
            </Typography>
            <TextField
              id="date"
              label="От"
              type="date"
              defaultValue={dateTimeOt}
              onChange={e => {
                setDateTimeOt(e.target.value);
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              id="date"
              label="До"
              type="date"
              defaultValue={dateTimeDo}
              onChange={e => {
                setDateTimeDo(e.target.value);
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Typography variant="h6" align='center' sx={{whiteSpace: 'nowrap'}}>
              Область интереса:
            </Typography>
            <Stack direction="row" spacing={2}>
              <div style={{border: "1px solid black", borderRadius: "10px", marginLeft: '100px'}}>
                <IconButton aria-label="delete" size="small" onClick={() => {
                  dotGeometry()
                }}>
                  <CircleIcon fontSize="inherit"/>
                </IconButton>
              </div>
              <div style={{border: "1px solid black", borderRadius: "10px"}}>
                <IconButton aria-label="delete" size="small" onClick={() => {
                  polygonGeometry()
                }}>
                  <CropSquareIcon fontSize="inherit"/>
                </IconButton>
              </div>
            </Stack>
            <Typography variant="h6" align='center' sx={{whiteSpace: 'nowrap'}}>
              Спутники:
            </Typography>
            <>
              <Typography variant="h6" sx={{whiteSpace: 'nowrap'}}>
                Панхроматическая съёмка
              </Typography>
              <FormGroup style={{border: "1px solid black"}}>
                <FormControlLabel control={<Checkbox checked={sens.PSS} onChange={setSensor("PSS")}/>}
                                  label="Канопус-B (2.7 м)"
                                  sx={{whiteSpace: 'nowrap'}}/>
              </FormGroup>
            </>
            <>
              <Typography variant="h6" sx={{whiteSpace: 'nowrap'}}>
                Мультиспектральная съёмка
              </Typography>
              <Box style={{border: "1px solid black"}}>
                <>
                  <Typography variant="h6" sx={{whiteSpace: 'nowrap'}}>
                    Высокое разрешение
                  </Typography>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox checked={sens.GTNL1} onChange={setSensor("GTNL1")}/>}
                                      label="Ресурс-П / сенсор Геотон-Л1"
                                      sx={{whiteSpace: 'nowrap'}}/>
                  </FormGroup>
                </>
                <>
                  <Typography variant="h6" sx={{whiteSpace: 'nowrap'}}>
                    Среднее разрешение
                  </Typography>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox checked={sens.SVR} onChange={setSensor("SVR")}/>}
                                      label="Ресурс-П"/>
                  </FormGroup>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox checked={sens.MSI} onChange={setSensor("MSI")}/>}
                                      label="Sentinel-2"/>
                  </FormGroup>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox checked={sens.OLITIRS} onChange={setSensor("OLITIRS")}/>}
                                      label="Landsat-8"/>
                  </FormGroup>

                  <FormControlLabel
                    label="Метеор-М №2, №2-2" sx={{whiteSpace: 'nowrap'}}
                    control={
                      <Checkbox
                        checked={sens.MSU101 && sens.MSU102 && sens.MSUTM101 && sens.MSUTM102}
                        indeterminate={sens.MSU101 !== sens.MSU102 !== sens.MSUTM101 !== sens.MSUTM102}
                        onChange={(e) => {
                          setSens({
                            ...sens,
                            MSU101: e.target.checked,
                            MSU102: e.target.checked,
                            MSUTM101: e.target.checked,
                            MSUTM102: e.target.checked
                          })
                        }}/>}
                  />
                  {children}
                </>
                <>
                  <Typography variant="h6" sx={{whiteSpace: 'nowrap'}}>
                    Низкое разрешение
                  </Typography>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox checked={sens.MSUMR} onChange={setSensor("MSUMR")}/>}
                                      label="Метеор-М №2-2"
                                      sx={{whiteSpace: 'nowrap'}}/>
                  </FormGroup>
                </>
              </Box>
            </>
            <>
              <Typography variant="h6" align='center'>
                Облачность %
              </Typography>
              <Slider
                getAriaLabel={() => 'Temperature range'}
                value={sliderValue}
                onChange={handleChangeSlider}
                valueLabelDisplay="auto"
                getAriaValueText={valuetext}
              />
            </>
            <Stack alignItems="center">
              <Button variant="contained" color="secondary" size="medium" disableElevation onClick={() => {
                findImages()
              }}>
                Найти
              </Button>
            </Stack>
          </Stack>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <Typography variant="h6" align='center' sx={{whiteSpace: 'nowrap'}}>
            Результаты:
          </Typography>
          <Stack>
            {finds.map((sensor, i) => (
              <Button key={i} onClick={() => {
                window.open(sensor.previews[0].url, '_blank', 'noopener,noreferrer')
              }}>{sensor.platform_name} {sensor.date_time_stamp}</Button>
            ))}
          </Stack>
        </TabPanel>
      </Stack>
      <Box width={"100%"}>
        <YMaps>
          <Map defaultState={{center: [58.60, 49.66], zoom: 7}} height={height} width={'100%'}
               onClick={(e: any) => onMapClick(e)}>
            {points.map((p) => (
              <Placemark geometry={p.coords} key={p.key} onClick={() => {
                removePoint(p.key)
              }}/>
            ))}
            {!isDot && (
              <GeoObject geometry={{type: 'LineString', coordinates: coordsPoint}} options={{fillColor: '#00FF00', strokeColor: '#0000FF', opacity: 0.5, strokeWidth: 5, strokeStyle: 'shortdash'}}/>
            )}
          </Map>
        </YMaps>
      </Box>
    </Stack>
  );
}