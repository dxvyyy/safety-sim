export const VEHICLES = [
  {name:'2022 Toyota Yaris',type:'sedan',mass:1050,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'Best-in-class city car safety'},
  {name:'2021 Volkswagen Polo',type:'sedan',mass:1185,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'Strong occupant protection for its segment'},
  {name:'2022 Fiat 500e',type:'sedan',mass:1365,stars:5,src:'Euro NCAP',ev:true,aeb:true,note:'Urban EV with full active safety suite'},
  {name:'2022 Toyota Corolla',type:'sedan',mass:1375,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'Benchmark for reliability and safety'},
  {name:'2022 Skoda Octavia',type:'sedan',mass:1430,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'Popular in Central Europe — close to your region'},
  {name:'2022 Volkswagen Golf',type:'sedan',mass:1415,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'European safety benchmark across all segments'},
  {name:'2022 Honda Accord',type:'sedan',mass:1505,stars:5,src:'NHTSA',ev:false,aeb:true,note:'IIHS Top Safety Pick+ designation'},
  {name:'2022 BMW 3 Series',type:'sedan',mass:1615,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'High-performance sedan with full ADAS suite'},
  {name:'2022 Toyota RAV4',type:'suv',mass:1750,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'Consistent Euro NCAP high performer'},
  {name:'2023 Volvo XC60',type:'suv',mass:1921,stars:5,src:'Euro NCAP',ev:false,aeb:true,note:'Highest-rated safety SUV — City Safety AEB leader'},
  {name:'2022 Ford Explorer',type:'suv',mass:2050,stars:5,src:'NHTSA',ev:false,aeb:true,note:'Full-size American family SUV'},
  {name:'2022 BMW X5',type:'suv',mass:2085,stars:5,src:'NHTSA',ev:false,aeb:true,note:'Luxury SUV with advanced stability systems'},
  {name:'2023 Tesla Model 3',type:'sedan',mass:1831,stars:5,src:'Euro NCAP',ev:true,aeb:true,note:'Autopilot ADAS suite, top EV safety rating'},
  {name:'2023 Tesla Model Y',type:'suv',mass:2003,stars:5,src:'Euro NCAP',ev:true,aeb:true,note:'Best-selling EV globally in 2023'},
  {name:'2023 Hyundai IONIQ 6',type:'sedan',mass:1985,stars:5,src:'Euro NCAP',ev:true,aeb:true,note:'World Car of the Year 2023'},
  {name:'2024 Volvo EX90',type:'suv',mass:2600,stars:5,src:'Euro NCAP',ev:true,aeb:true,note:'Highest Euro NCAP score ever recorded (2024)'},
  {name:'2022 Ford F-150',type:'truck',mass:2200,stars:5,src:'NHTSA',ev:false,aeb:true,note:'Best-selling vehicle in North America'},
  {name:'2022 Mercedes Sprinter',type:'truck',mass:2450,stars:4,src:'Euro NCAP',ev:false,aeb:true,note:'Commercial van benchmark for safety'},
  {name:'2023 Honda CBR600RR',type:'motorcycle',mass:195,stars:0,src:'N/A',ev:false,aeb:false,note:'No passive protection. Rider gear is the only system.'},
  {name:'Volvo 9700 Coach (2022)',type:'bus',mass:14000,stars:0,src:'UNECE',ev:false,aeb:true,note:'Professional coach with rollover cage structure'},
];

export function matchVehicle(cfg){
  const {vehicleType:vt,mass,isEV,sys}=cfg;
  let best=VEHICLES[0],top=-1;
  for(const v of VEHICLES){
    let s=0;
    if(v.type===vt) s+=40;
    else if((vt==='sedan'&&v.type==='suv')||(vt==='suv'&&v.type==='sedan')) s+=15;
    const mr=Math.abs(v.mass-mass)/Math.max(v.mass,mass);
    s+=Math.round(30*(1-Math.min(1,mr)));
    if(isEV&&v.ev) s+=20; else if(!isEV&&!v.ev) s+=10;
    if(sys.aeb===v.aeb) s+=5;
    if(s>top){top=s;best=v;}
  }
  return {vehicle:best,pct:Math.min(97,Math.round(top*0.98))};
}
