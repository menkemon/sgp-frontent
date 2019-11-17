import axios, { AxiosResponse } from 'axios';
import { IProyecto, ITransaccion, IFondos, Iprograma, IListaTransancionCDP } from '../interfaces/interface';
import { Icomponente } from '../interfaces/interface';
import { globalServices } from './globalService';

class ProyectoService {

  private proyecto: IProyecto = {} as IProyecto;
  private proyectos: IProyecto[] = [];
  constructor() {

  }

  public async obtenerDimensiones() {
    const data = await axios
      .get(globalServices.url + '/proyecto')
      .then((response: AxiosResponse) => {

        let dato;
        if (Array.isArray(response.data)) {
          dato = response.data;
        } else {
          dato = [response.data];
        }
        return dato.map((val: any) => ({
          value: val.id,
          text: val.nombre,

        }));
      });
    return data;
  }

  // metodos del CRUD
  public async obtenerDatos(value?: number, rutaContralador?: string) {
    const urlLocal: string = globalServices.url + '/' + rutaContralador;
    value == 0 ? urlLocal : urlLocal + '/' + value;

    const data = await axios
      .get(urlLocal)
      .then((response: AxiosResponse) => {

        let dato;
        if (Array.isArray(response.data)) {
          dato = response.data;
        } else {
          dato = [response.data];
        }
        return dato.map((val: any) => ({
          value: val.id,
          text: val.Nombre,



        }));
      });
    return data;
  }


  public async comunidades() {
    let urlLocal: string = globalServices.url;

    const data = await axios
      .get(urlLocal += 'comunidades')
      .then((response: AxiosResponse) => {
        const dato = [response.data];
        return dato.map((val: any) => ({
          value: val.codigo,
          text: val.nombre,
        }));
      });

    return data;

  }





  public async registrarPropuesta(rawData: any) {
    rawData = JSON.stringify(rawData);

    const formData = new FormData();

    formData.append('propuesta', rawData);
    try {
      const response = await axios.post(globalServices.url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data[0];
    } catch (e) {
      return null;
    }
  }

  public async GetProyectosPorEstado(estado: number) {
    await axios.get(globalServices.url + "/proyecto/estado/" + estado).then((response: AxiosResponse) => {
      this.proyectos = response.data.map((val: any) => ({
        Codigo: val.codigo,
        Nombre: val.nombre,
        ProyectoState: val.proyectoState,
        Id: val.id,
        PresupuestoAprobado: val.presupuestoAprobado,
        PresupuestoEjecutado: val.presupuestoEjecutado,
      }));
    });
    return this.proyectos;
  }
  public async GetGastosProyecto(proyecto: IProyecto) {
    let gastos: ITransaccion[] = [];
    await axios
      .get(globalServices.url + '/proyecto/egresos/' + proyecto.Id)
      .then((response: AxiosResponse) => {
        gastos = response.data.map((val: any) => ({
          Monto: val.monto,
          Fecha:
            new Date(val.fecha.toString()).getDate() +
            '/' +
            new Date(val.fecha.toString()).getMonth() +
            '/' +
            new Date(val.fecha.toString()).getFullYear(),

          Id: val.id,
          Concepto: val.concepto,
        }));
      });
    }
    public async GetProyectosCDP(estado:number) {
      //this.urlProyecto+"EmitirCDP/listarProyectos/" 
      let proyectosEmitirCDP: IProyecto[] = [];
      const data = await axios.get(globalServices.url+'/proyecto/'+estado
        ).then((response: AxiosResponse) => {
          this.getPropuesta(response.data.propuestaId).then(p=>{
            response.data.propuesta = p;
            return response.data;
          })
      });
      console.log(data);
      return data;
  }

  public async getPropuesta(id: number){
      const data = await axios.get(globalServices.url+'/propuesta/'+id
        ).then((response: AxiosResponse) => {
          return response.data;
        });
        return data;
  }

  public async GetFondos() {
    //this.urlProyecto+"EmitirCDP/listarFondos"
    let fondos: IFondos[] = [];
    await axios.get("https://localhost:5001/api/fondo/").then((response: AxiosResponse) => {
        fondos = response.data.map((val: any) => ({
            nombre: val.nombre,
            valor: val.valor,
        }));
    });
    console.log("Fondos Api", fondos);
    return fondos;
  }

  public async PostCDP(idProyecto:number, transancion:IListaTransancionCDP[]) {
    //this.urlProyecto+"EmitirCDP/listarProyectos/" 
    await axios.post(globalServices.url+"CertificadoDeDisponibilidadPresupuestal/",{      
        codigo: idProyecto,   
        listaTransanciones:transancion  
    }
    ).then((response: AxiosResponse) => {        
    });


  }

    
  public RegistrarGasto(gastoProyecto: ITransaccion) {
    console.log();

     axios.post(globalServices.url + "/transaccion", gastoProyecto).then((Response) => {
      console.log(Response);
    });
  }
  public async GetProyectoPorId(idProyecto: number) {

    await axios.get(`${globalServices.url}/proyecto/${idProyecto}`).then((Response: AxiosResponse) => {
      this.proyecto = Response.data.map((val: any) => ({
        Codigo: val.codigo,
        Nombre: val.nombre,
        ProyectoState: val.proyectoState,
        Id: val.id,
        PresupuestoAprobado: val.presupuestoAprobado,
        PresupuestoEjecutado: val.presupuestoEjecutado,
      }))
    });
    return this.proyecto;
  }
}
export const proyectoService = new ProyectoService();
