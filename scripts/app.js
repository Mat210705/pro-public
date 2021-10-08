// let miembros = data.results[0].members

let capturaTabla = document.getElementById("table-senate")


const app = Vue.createApp({

    data() {
        return {
            members: [],
            party: [],
            estado: '',
            estadisticas: {
                Republicans: [],
                Democrats: [],
                Independents: [],
                republicanVoteParty: 0, //votos por partido
                democratsVoteParty: 0, //votos por partido
                independentsVoteParty: 0, //votos por partido
                republicanVoteAverage: 0, //promedio de votos
                democratsVoteAverage: 0, //promedio de votos
                independentsVoteAverage: 0, //promedio de votos
                congressmenWithVotes: 0, //congresistasConVotos
                congressmenWigherWotes: [], //de menor a Mayor
                congressmenFewerVotes: [], //de mayor a Menor
                leastLoyalty: [], //de Menor a Mayor
                mostLoyalty: [], //de mayor a Menor

            }

        }
    },
    created() {

        let init = {
            headers: {
                "X-API-key": "kXEFGDkyPY0SQ5d4FOGLiFEUwsUcVO9cCAsDHJJl"
            }
        }
        let chamber = capturaTabla ? "senate" : "house"
        let endpoint = `https://api.propublica.org/congress/v1/113/${chamber}/members.json`

        fetch(endpoint, init)
            .then(res => res.json())
            .then(data => {
                this.members = data.results[0].members;
                this.cantidadPorPartido();
                this.promedioVotosPerdidos();
                this.congresistasConVotos();
                this.congresistasConVotosMayor();
                this.congresistasConVotosMenor();
                this.congresistasConVotosMayorLoyalty();
                this.congresistasConVotosMenorLoyalty();
                this.promedioVotosPorPartido();

            })
    },

    methods: {
        cantidadPorPartido() {
            this.estadisticas.Republicans = this.members.filter(member => member.party === "R");
            this.estadisticas.Democrats = this.members.filter(member => member.party === "D");
            this.estadisticas.Independents = this.members.filter(member => member.party === "ID");
        },
        promedioVotosPerdidos() {
            let votosPromedio = function(array) {
                let reducirVotos = array.reduce((acumulador, members) => {
                    return acumulador += members.missed_votes
                }, 0)
                reducirVotos = parseFloat((reducirVotos / array.length).toFixed(2))
                return reducirVotos
            }
            this.estadisticas.republicanVoteAverage = votosPromedio(this.estadisticas.Republicans);
            this.estadisticas.democratsVoteAverage = votosPromedio(this.estadisticas.Democrats);
            this.estadisticas.independentsVoteAverage = votosPromedio(this.estadisticas.Independents);
        },
        congresistasConVotos() {
            this.estadisticas.congressmenWithVotes = this.members.filter(member => member.total_votes > 0);

        },
        //de menor a mayor
        congresistasConVotosMayor() {
            this.estadisticas.congressmenWigherWotes = this.estadisticas.congressmenWithVotes.sort((a, b) => {
                if (a["missed_votes"] < b["missed_votes"]) {
                    return -1;
                } else if (a["missed_votes"] > b["missed_votes"]) {
                    return 1;
                } else {
                    return 0;
                }

            })

            let puntoDeCorte = Math.ceil(this.estadisticas.congressmenWigherWotes.length * 0.1)
            let porcentajeFinal = this.estadisticas.congressmenWigherWotes[puntoDeCorte - 1] //incluir repetidos
            this.estadisticas.congressmenWigherWotes = this.estadisticas.congressmenWigherWotes.filter(member => member.missed_votes_pct <= porcentajeFinal.missed_votes_pct)
        },
        //de mayor a menor
        congresistasConVotosMenor() {
            this.estadisticas.congressmenFewerVotes = this.estadisticas.congressmenWithVotes.sort((a, b) => {
                if (a["missed_votes_pct"] > b["missed_votes_pct"]) {
                    return -1;
                } else if (a["missed_votes_pct"] < b["missed_votes_pct"]) {
                    return 1;
                } else {
                    return 0;
                }
            })

            let puntoDeCorte = Math.ceil(this.estadisticas.congressmenFewerVotes.length * 0.1)
            let porcentajeFinal = this.estadisticas.congressmenFewerVotes[puntoDeCorte - 1]
            this.estadisticas.congressmenFewerVotes = this.estadisticas.congressmenFewerVotes.filter(member => member.missed_votes_pct <= porcentajeFinal.missed_votes_pct)
        },
        // loyalty

        promedioVotosPorPartido() {
            let votosPromedioPartido = function(array) {
                let reducirVotos = array.reduce((acumulador, members) => {
                    return acumulador += members.votes_with_party_pct
                }, 0)
                reducirVotos = parseFloat((reducirVotos / array.length).toFixed(2))
                return reducirVotos
              }
              this.estadisticas.republicanVoteParty = votosPromedioPartido(this.estadisticas.Republicans);
              this.estadisticas.democratsVoteParty = votosPromedioPartido(this.estadisticas.Democrats);
              this.estadisticas.independentsVoteParty = votosPromedioPartido(this.estadisticas.Independents);
            },


        //de menor a mayor
        congresistasConVotosMayorLoyalty() {
            let filtrado = this.members.filter(member => member.total_votes > 0);
            this.estadisticas.leastLoyalty = filtrado.sort((a, b) => {
                if (a["votes_with_party_pct"] < b["votes_with_party_pct"]) {
                    return -1;
                } else if (a["votes_with_party_pct"] > b["votes_with_party_pct"]) {
                    return 1;
                } else {
                    return 0;
                }

            })
            let puntoDeCorte = Math.ceil(filtrado.length * 0.1)
            let porcentajeFinal = filtrado[puntoDeCorte - 1]
            this.estadisticas.leastLoyalty = filtrado.filter(member => member.votes_with_party_pct <= porcentajeFinal.votes_with_party_pct)
        },
        //de mayor a menor
        congresistasConVotosMenorLoyalty() {
          let filtrado = this.members.filter(member => member.total_votes > 0);
          this.estadisticas.mostLoyalty = filtrado.sort((a, b) => {
              if (a["votes_with_party_pct"] < b["votes_with_party_pct"]) {
                  return 1;
              } else if (a["votes_with_party_pct"] > b["votes_with_party_pct"]) {
                  return -1;
              } else {
                  return 0;
              }

          })
          let puntoDeCorte = Math.ceil(filtrado.length * 0.1)
          let porcentajeFinal = filtrado[puntoDeCorte - 1]
          this.estadisticas.mostLoyalty = filtrado.filter(member => member.votes_with_party_pct >= porcentajeFinal.votes_with_party_pct)
        },


    },

    computed: {
        membersFiltrados() {
            let otroArray = [];
            otroArray = this.members.filter(member => this.party.includes(member.party) && (this.estado === member.state || this.estado === ""))
            return otroArray
        }
    }

})



const consol = app.mount("#app")

// console.log(member.republicanos)
