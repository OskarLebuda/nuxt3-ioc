export default function Identity(name: string): symbol {
	return Symbol.for(name);
}