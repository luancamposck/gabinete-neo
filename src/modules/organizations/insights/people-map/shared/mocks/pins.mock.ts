import type { CityPin } from "../types/pins"

export const pins: CityPin[] = [
	{
		id: "br-df-brasilia",
		city: "Brasília",
		state: "DF",
		country: "Brasil",
		lat: -15.793889,
		lng: -47.882778,
		users: [
			{ id: "df-1", name: "Ana Martins" },
			{ id: "df-2", name: "Bruno Lima" },
			{ id: "df-3", name: "Carla Souza" },
			{ id: "df-4", name: "Diego Alves" }
		]
	},
	{
		id: "br-ro-vilhena",
		city: "Vilhena",
		state: "RO",
		country: "Brasil",
		lat: -12.7502,
		lng: -60.1488,
		users: [
			{ id: "ro-1", name: "Érica Mendes" },
			{ id: "ro-2", name: "Felipe Rocha" },
			{ id: "ro-3", name: "Gabi Nascimento" },
			{ id: "ro-4", name: "Henrique Costa" }
		]
	},
	{
		id: "br-rj-rio-de-janeiro",
		city: "Rio de Janeiro",
		state: "RJ",
		country: "Brasil",
		lat: -22.9068,
		lng: -43.1729,
		users: [
			{ id: "rj-1", name: "Isabela Ferreira" },
			{ id: "rj-2", name: "João Pedro" },
			{ id: "rj-3", name: "Karla Ribeiro" },
			{ id: "rj-4", name: "Lucas Andrade" }
		]
	},
	{
		id: "br-sp-sao-paulo",
		city: "São Paulo",
		state: "SP",
		country: "Brasil",
		lat: -23.55052,
		lng: -46.633308,
		users: [
			{ id: "sp-1", name: "Mariana Silva" },
			{ id: "sp-2", name: "Nicolas Barros" },
			{ id: "sp-3", name: "Olívia Gomes" },
			{ id: "sp-4", name: "Paulo Vieira" }
		]
	},
	{
		id: "br-mg-belo-horizonte",
		city: "Belo Horizonte",
		state: "MG",
		country: "Brasil",
		lat: -19.9167,
		lng: -43.9345,
		users: [
			{ id: "mg-1", name: "Quezia Cardoso" },
			{ id: "mg-2", name: "Rafael Pinto" },
			{ id: "mg-3", name: "Sabrina Duarte" },
			{ id: "mg-4", name: "Thiago Araújo" }
		]
	},
	{
		id: "br-pr-curitiba",
		city: "Curitiba",
		state: "PR",
		country: "Brasil",
		lat: -25.4284,
		lng: -49.2733,
		users: [
			{ id: "pr-1", name: "Ursula Teixeira" },
			{ id: "pr-2", name: "Vitor Hugo" },
			{ id: "pr-3", name: "Wesley Almeida" },
			{ id: "pr-4", name: "Yasmin Santos" }
		]
	},
	{
		id: "br-rs-porto-alegre",
		city: "Porto Alegre",
		state: "RS",
		country: "Brasil",
		lat: -30.0346,
		lng: -51.2177,
		users: [
			{ id: "rs-1", name: "Zeca Monteiro" },
			{ id: "rs-2", name: "Aline Farias" },
			{ id: "rs-3", name: "Breno Pacheco" },
			{ id: "rs-4", name: "Camila Brandão" }
		]
	},
	{
		id: "br-sc-florianopolis",
		city: "Florianópolis",
		state: "SC",
		country: "Brasil",
		lat: -27.5949,
		lng: -48.5482,
		users: [
			{ id: "sc-1", name: "Daniela Moraes" },
			{ id: "sc-2", name: "Eduardo Batista" },
			{ id: "sc-3", name: "Fabiana Cunha" },
			{ id: "sc-4", name: "Guilherme Reis" }
		]
	},
	{
		id: "br-go-goiania",
		city: "Goiânia",
		state: "GO",
		country: "Brasil",
		lat: -16.6869,
		lng: -49.2648,
		users: [
			{ id: "go-1", name: "Helena Campos" },
			{ id: "go-2", name: "Igor Matos" },
			{ id: "go-3", name: "Júlia Freitas" },
			{ id: "go-4", name: "Kaique Oliveira" }
		]
	},
	{
		id: "br-mt-cuiaba",
		city: "Cuiabá",
		state: "MT",
		country: "Brasil",
		lat: -15.6014,
		lng: -56.0979,
		users: [
			{ id: "mt-1", name: "Larissa Braga" },
			{ id: "mt-2", name: "Matheus Lopes" },
			{ id: "mt-3", name: "Nayara Lima" },
			{ id: "mt-4", name: "Otávio Souza" }
		]
	},
	{
		id: "br-am-manaus",
		city: "Manaus",
		state: "AM",
		country: "Brasil",
		lat: -3.119,
		lng: -60.0217,
		users: [
			{ id: "am-1", name: "Priscila Araújo" },
			{ id: "am-2", name: "Ruan Ferreira" },
			{ id: "am-3", name: "Sara Nogueira" },
			{ id: "am-4", name: "Tomás Ribeiro" }
		]
	},
	{
		id: "br-pa-belem",
		city: "Belém",
		state: "PA",
		country: "Brasil",
		lat: -1.4558,
		lng: -48.4902,
		users: [
			{ id: "pa-1", name: "Ulisses Barros" },
			{ id: "pa-2", name: "Valéria Lopes" },
			{ id: "pa-3", name: "William Souza" },
			{ id: "pa-4", name: "Yara Mendes" }
		]
	},

	// Nordeste (garantido)
	{
		id: "br-ce-fortaleza",
		city: "Fortaleza",
		state: "CE",
		country: "Brasil",
		lat: -3.7319,
		lng: -38.5267,
		users: [
			{ id: "ce-1", name: "Amanda Rocha" },
			{ id: "ce-2", name: "Bruno Cavalcante" },
			{ id: "ce-3", name: "Carolina Melo" },
			{ id: "ce-4", name: "Diego Vasconcelos" }
		]
	},
	{
		id: "br-ba-salvador",
		city: "Salvador",
		state: "BA",
		country: "Brasil",
		lat: -12.9777,
		lng: -38.5016,
		users: [
			{ id: "ba-1", name: "Ester Santana" },
			{ id: "ba-2", name: "Felipe Dantas" },
			{ id: "ba-3", name: "Giovana Reis" },
			{ id: "ba-4", name: "Heitor Araújo" }
		]
	},
	{
		id: "br-pe-recife",
		city: "Recife",
		state: "PE",
		country: "Brasil",
		lat: -8.0476,
		lng: -34.877,
		users: [
			{ id: "pe-1", name: "Isis Albuquerque" },
			{ id: "pe-2", name: "João Vitor" },
			{ id: "pe-3", name: "Karen Lima" },
			{ id: "pe-4", name: "Leonardo Sousa" }
		]
	},
	{
		id: "br-rn-natal",
		city: "Natal",
		state: "RN",
		country: "Brasil",
		lat: -5.7945,
		lng: -35.211,
		users: [
			{ id: "rn-1", name: "Marina Queiroz" },
			{ id: "rn-2", name: "Nataniel Costa" },
			{ id: "rn-3", name: "Olga Ferreira" },
			{ id: "rn-4", name: "Pedro Henrique" }
		]
	},
	{
		id: "br-pb-joao-pessoa",
		city: "João Pessoa",
		state: "PB",
		country: "Brasil",
		lat: -7.1153,
		lng: -34.861,
		users: [
			{ id: "pb-1", name: "Queila Moreira" },
			{ id: "pb-2", name: "Rafael Nunes" },
			{ id: "pb-3", name: "Sofia Araújo" },
			{ id: "pb-4", name: "Tiago Moura" }
		]
	},
	{
		id: "br-al-maceio",
		city: "Maceió",
		state: "AL",
		country: "Brasil",
		lat: -9.6498,
		lng: -35.7089,
		users: [
			{ id: "al-1", name: "Uendel Lima" },
			{ id: "al-2", name: "Vitória Barros" },
			{ id: "al-3", name: "Wellington Santos" },
			{ id: "al-4", name: "Yasmin Costa" }
		]
	},
	{
		id: "br-ma-sao-luis",
		city: "São Luís",
		state: "MA",
		country: "Brasil",
		lat: -2.5307,
		lng: -44.3068,
		users: [
			{ id: "ma-1", name: "Ariane Oliveira" },
			{ id: "ma-2", name: "Bruno Martins" },
			{ id: "ma-3", name: "Carla Sales" },
			{ id: "ma-4", name: "Diego Ribeiro" }
		]
	},
	{
		id: "br-pi-teresina",
		city: "Teresina",
		state: "PI",
		country: "Brasil",
		lat: -5.0919,
		lng: -42.8034,
		users: [
			{ id: "pi-1", name: "Elisa Freire" },
			{ id: "pi-2", name: "Fábio Nascimento" },
			{ id: "pi-3", name: "Gisele Rocha" },
			{ id: "pi-4", name: "Hugo Almeida" }
		]
	},

	// Fecha 20 com mais 2 cidades fortes
	{
		id: "br-es-vitoria",
		city: "Vitória",
		state: "ES",
		country: "Brasil",
		lat: -20.3155,
		lng: -40.3128,
		users: [
			{ id: "es-1", name: "Isadora Cunha" },
			{ id: "es-2", name: "João Gabriel" },
			{ id: "es-3", name: "Kamila Duarte" },
			{ id: "es-4", name: "Leandro Vieira" }
		]
	},
	{
		id: "br-ms-campo-grande",
		city: "Campo Grande",
		state: "MS",
		country: "Brasil",
		lat: -20.4697,
		lng: -54.6201,
		users: [
			{ id: "ms-1", name: "Marcos Vinícius" },
			{ id: "ms-2", name: "Natália Lopes" },
			{ id: "ms-3", name: "Otto Ramos" },
			{ id: "ms-4", name: "Patrícia Souza" }
		]
	}
] as const
