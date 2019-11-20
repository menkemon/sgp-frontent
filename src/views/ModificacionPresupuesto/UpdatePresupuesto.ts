import Vue from 'vue';
import jsPDF from 'jspdf'
import {Component} from 'vue-property-decorator';
import template from './ActualizacionPresupuesto.vue';
import { proyectoService } from '../../services/proyectoService';
import { IProyecto, IFondos, ITransancionCDP, IListaTransancionCDP } from '../../interfaces/interface';
import { VMoney } from 'v-money';
import VCurrencyField from 'v-currency-field'



@Component({
    name: 'ActualizacionPresupuesto',
    mixins: [template],
    directives: { money: VMoney, currency:VCurrencyField }
})
export default class ActualizacionPresupuesto extends Vue {
    public headersEmitirCDP = [
        {
            text: '',
            align: 'left',
            sortable: false,
            value: 'num',
        },
        { text: 'Código', value: 'id' },
        { text: 'Nombre', value: 'nombre' },
        { text: 'Estado', value: 'proyectoState' },
        {
            text: 'Presupuesto Aprobado',
            value: 'presupuestoAprobado',
            align: 'center',
        },
        {
            text: 'Acción',
            value: 'actionEmitirCDP',
            sortable: false,
            align: 'center',
        },
    ];
    public headersTransancion = [
        {
            text: '',
            align: 'left',
            sortable: false,
            value: 'num',
        },
        { text: 'Nombre del Fondo', value: 'nombreFondo' },
        { text: 'Valor del Fondo', value: 'valorFondo' },
        { text: 'Valor Retirado', value: 'valorRetirado' },
        
        {
            text: 'Acción',
            value: 'eliminarTransancion',
            sortable: false,
            align: 'center',
        },
    ];
    public money = {
        decimal: ',',
        thousands: '.',
        precision: 2,
        masked: false
    }
    public currency ={ 
        locale: 'pt-BR',
        decimalLength: 2,
        autoDecimalMode: true,
        min: null,
        max: null,
        defaultValue: 0
    }
    public estado:number = 1;
    public name:string='pdf';
    public itemsEstado = [
        { text: 'Emitir CDP', value: 1 },
        //{ text: 'Consultar CDP', value: 2 },
    ]

    public fondos: IFondos[] = [];
    public proyectos: IProyecto[] = [];  
    public proyecto : IProyecto = {} as IProyecto; 
    public transancionCDP: ITransancionCDP = {} as ITransancionCDP; 
    public transancionesCDP: ITransancionCDP[] = [];  
    public editedIndex = -1;
    public dialog = false;
    public dialogCDP = false;
    public search = '';
    public itemsPerPage: number = 5;
    public validarActivarBotom: boolean = true;
    public presupuestoGeneral: number = 0;
    public valorGeneralTransanciones : number = 0;

    public nombresFondos():String[]{
        
        let nombres: String[] = [];
        this.fondos.forEach(element => {
            nombres.push(element.nombre);
               
        });  
        console.log("Fondos nombres",nombres);
            
        return nombres;
    }

    public validarMonto(valorProyecto:number) {
        if(this.transancionCDP.valorRetirado>this.transancionCDP.valorFondo ){
            return "Valor retirado sobrepasa al valor actual del fondo";
        } else{
            if(this.transancionCDP.valorRetirado>valorProyecto){
                return "Valor retirado sobrepasa al valor actual del proyecto a financiar";
                
            }else{
                console.log("valor retirado",Number(this.valorGeneralTransanciones) + Number(this.transancionCDP.valorRetirado));
                if(Number(this.valorGeneralTransanciones) + Number(this.transancionCDP.valorRetirado)>this.proyecto.presupuestoAprobado){

                    return "el valor de las transanciones sobrepasa al valor aprovado del proyecto";
                }else{
                    if(this.transancionCDP.valorRetirado<0){
                        return "el valor debe ser mayor a 0";
                    }
                }
            }
        }            
        return false; 
    }

    public valorFondos(nombre:string):number{
        let valor: number =0;
        this.fondos.forEach(element => {
            if(element.nombre==nombre){
                valor = element.valor;
            }
        });      
        return valor;
    }

    public fondoGeneral(){
        this.presupuestoGeneral=0;  
        this.fondos.forEach(element => {
            this.presupuestoGeneral  += Number(element.valor);         
        });  
               
    }
    
    public calcularValorGeneralTransanciones(valorRetirado:number, opcion:number){
        if(opcion==1){
            this.valorGeneralTransanciones = Number(this.valorGeneralTransanciones) + Number(valorRetirado);
        }else{
            this.valorGeneralTransanciones = Number(this.valorGeneralTransanciones) - Number(valorRetirado);
        }
    }
    public validarBotom(){
        if(this.transancionCDP.nombreFondo===undefined || this.transancionCDP.valorRetirado===undefined || this.transancionCDP.valorRetirado==0){            
           return true;             
        }
        if (!this.validarMonto || this.transancionCDP.valorRetirado < 0){
            return true;
        }
        return false;
    }
    public asignarValor(nombre:any){
        this.transancionCDP.valorFondo = this.valorFondos(nombre);  
    }

    public editItem(item: any) {  
        this.abrirModal(item);
    }

    public abrirModal(item: any) {
        this.dialog = true;
        this.proyecto = item;
        this.transancionCDP = {} as ITransancionCDP; 
        this.transancionesCDP = []; 
        this.fondoGeneral();
    }
    public abrirModalCDP() {
        this.dialogCDP = true;
    }
    public agregarTransancionCDP(transancionCDP:ITransancionCDP){
        let transancionCDPlocal: ITransancionCDP = transancionCDP;        
        transancionCDPlocal.valorFondo = this.actualizarFondos(transancionCDPlocal,1);
        
        if(this.transancionesCDP.length==0){
            this.transancionesCDP.push(transancionCDPlocal);                
        }else
        {
            if(this.buscarTransancion(transancionCDPlocal)==false){
                this.transancionesCDP.push(transancionCDPlocal);                    
            }                
        }   
        this.calcularValorGeneralTransanciones(transancionCDPlocal.valorRetirado,1); 
        this.fondoGeneral();        
        this.transancionCDP = {} as ITransancionCDP;       
    
    }

    public eliminarTransancion(item:any){
        let transancionCDPlocal: ITransancionCDP = item;
        this.actualizarFondos(item,2);   
        this.calcularValorGeneralTransanciones(transancionCDPlocal.valorRetirado,2);
        let cont = this.transancionesCDP.indexOf(item); 
        this.transancionesCDP.splice(cont,1);                          
        this.fondoGeneral();
        this.transancionCDP = {} as ITransancionCDP;  
    }

    
    public buscarTransancion(transancionCDP:ITransancionCDP):boolean{
        let retorno:boolean =false;
        this.transancionesCDP.forEach(element => {
            if(transancionCDP.nombreFondo===element.nombreFondo){
                element.valorFondo = Number(transancionCDP.valorFondo);
                element.valorRetirado = Number(element.valorRetirado) + Number(transancionCDP.valorRetirado); 
                retorno = true;                
            }            
        });
        
        return retorno;
    }

    public actualizarFondos(transancionCDP:ITransancionCDP,opcion:number):number{
        let valorActualizado: number = 0;
        this.fondos.forEach(element=>{
            if(element.nombre==transancionCDP.nombreFondo){
                if(opcion==1){
                    if(element.valor>transancionCDP.valorRetirado){
                        element.valor = Number(element.valor) - Number(transancionCDP.valorRetirado);
                        valorActualizado = Number(element.valor);
                    }
                }else{                    
                    element.valor += Number(transancionCDP.valorRetirado);
                    valorActualizado = Number(element.valor);                    
                }
            }
        });
        return valorActualizado;
    }

    public crearCDP(proyectoId:number){
        // this.generarPdf();
            let listaTrasancionesCDP:IListaTransancionCDP []=[];
            let listaTrasancionCDP:IListaTransancionCDP = {} as IListaTransancionCDP;
            this.transancionesCDP.forEach(element=>{
                listaTrasancionCDP.nombreFondo = element.nombreFondo;
                listaTrasancionCDP.valorRetirado = element.valorRetirado;
                listaTrasancionesCDP.push(listaTrasancionCDP);
            });  
            
           proyectoService.PostCDP(proyectoId,listaTrasancionesCDP).then((res) => (console.log(res)));
            // this.abrirModalCDP(this.proyecto,this.transancionCDP);
    }
    
    public consultarProyectos(parametro:any, opcion:number){
        
        if(opcion==0){
            this.estado=parametro;
        }else{
            this.estado=parametro.value
        }

        proyectoService.GetProyectosPorEstado(this.estado).then(response=>{
            this.proyectos = response;
            
        });

    }

    public consultarFondos(){
        proyectoService.GetFondos().then((res) =>{
            (this.fondos = res )
            console.log("Resspuesta consultar fondos",res);
            
        } );
        console.log("fondos---", this.fondos);
        
    }

    public generarPdf(){        
        let doc = new jsPDF();
        doc.fromHTML(document.getElementById("pdf"), 20,20,{'width':500});  //<-- not good. How can I refactor this?
        doc.save("mypdf.pdf");   
        // let pdfName = 'test'; 
        // var doc = new jsPDF();
        // doc.text(this.name, 10, 10);
        // doc.save(pdfName + '.pdf'); 
    }
    
    public mounted() {
        this.consultarProyectos(this.estado,0);
        this.consultarFondos();        
    }
    


}
