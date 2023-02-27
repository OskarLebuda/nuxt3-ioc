import { Container } from "../../src/runtime/ioc/Container";
import TestService from "../service/TestService";

export default function iocProvider(container: Container): void {

    container.bind(TestService);

}