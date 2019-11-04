import axios, { AxiosResponse } from 'axios';
import { IProyecto, ITransaccion } from '../interfaces/interface';

class ProyectoService {

  public url = 'api/propuesta/add';
  constructor() {

  }
  // metodos del CRUD
  public async obtenerDatos(value?: number) {
    let urlLocal: string = this.url;
    value == 0 ? urlLocal : urlLocal += `${value}`;
    console.log(urlLocal);

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
          text: val.surname,
        }));
      });
    console.log('data: ' + data);
    return data;
  }


  public async comunidades() {
    let urlLocal: string = this.url;

    const data = await axios
      .get(urlLocal += 'comunidades')
      .then((response: AxiosResponse) => {
        console.log('response: ' + response);
        const dato = [response.data];
        return dato.map((val: any) => ({
          value: val.codigo,
          text: val.nombre,
        }));
      });

    return data;

  }

  public async cofinanciador() {
    let urlLocal: string = this.url;

    const data = await axios
      .get(urlLocal += 'confinanciador')
      .then((response: AxiosResponse) => {
        console.log('response: ' + response);
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
     console.log('rawData: ' + rawData);

     const formData = new FormData();

     formData.append('propuesta', rawData);
     try {
              const response = await  axios.post(this.url,
              formData,
              {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
              });
              return response.data[0];
            } catch (e) {
                return null;
            }
        }





    public async GetProyectosRP() {
        let proyectosConRP: IProyecto[] = [];
        await axios.get(this.url).then((response: AxiosResponse) => {
            proyectosConRP = response.data.map((val: IProyecto) => ({
                codigo: val.codigo,
                nombre: val.nombre,
                presupuestoAprovado:
                    '$ ' +
                    new Intl.NumberFormat().format(val.presupuestoAprovado),
                proyectoState: val.proyectoState,
                id: val.id,
            }));
        });
        console.log(proyectosConRP);

        return proyectosConRP;
    }
    public async GetGastosProyecto(proyecto: IProyecto) {
        let gastos: ITransaccion[] = [];
        await axios
            .get(this.url + '/' + proyecto.id)
            .then((response: AxiosResponse) => {
                gastos = response.data.map((val: any) => ({
                    Monto: val.monto,
                    Fecha:
                        new Date(val.fecha.toString()).getDate() +
                        '/' +
                        new Date(val.fecha.toString()).getMonth() +
                        '/' +
                        new Date(val.fecha.toString()).getFullYear(),

                    id: val.id,
                }));
            });

        return gastos;
    }
}
export const proyectoService = new ProyectoService();
