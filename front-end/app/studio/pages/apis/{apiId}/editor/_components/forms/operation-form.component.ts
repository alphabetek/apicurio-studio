/**
 * @license
 * Copyright 2017 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, Input, ViewEncapsulation, Output, EventEmitter, ViewChild} from "@angular/core";
import {
    Oas20Operation, Oas20Parameter, Oas20Response,
    Oas20Document, Oas20PathItem
} from "oai-ts-core";
import {ICommand} from "../../_services/commands.manager";
import {NewRequestBodyCommand} from "../../_commands/new-request-body.command";
import {ChangeParameterTypeCommand} from "../../_commands/change-parameter-type.command";
import {ChangePropertyCommand} from "../../_commands/change-property.command";
import {
    DeleteNodeCommand, DeleteAllParameters, DeleteParameterCommand,
    DeleteResponseCommand
} from "../../_commands/delete.command";
import {NewResponseCommand} from "../../_commands/new-response.command";
import {AddQueryParamDialogComponent} from "../dialogs/add-query-param.component";
import {AddResponseDialogComponent} from "../dialogs/add-response.component";
import {SourceFormComponent} from "./source-form.base";
import {ReplaceOperationCommand} from "../../_commands/replace.command";
import {ObjectUtils} from "../../_util/object.util";
import {SimplifiedType} from "../../_models/simplified-type.model";
import {ChangeResponseTypeCommand} from "../../_commands/change-response-type.command";
import {DropDownOption} from "../common/drop-down.component";
import {AddFormDataParamDialogComponent} from "../dialogs/add-formData-param.component";
import {NewParamCommand} from "../../_commands/new-param.command";
import {ModelUtils} from "../../_util/model.util";


@Component({
    moduleId: module.id,
    selector: "operation-form",
    templateUrl: "operation-form.component.html",
    encapsulation: ViewEncapsulation.None
})
export class OperationFormComponent extends SourceFormComponent<Oas20Operation> {

    protected _operation: Oas20Operation;
    @Input()
    set operation(operation: Oas20Operation) {
        this._operation = operation;
        this.sourceNode = operation;
    }
    get operation(): Oas20Operation {
        return this._operation;
    }

    @Output() onDeselect: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild("addFormDataParamDialog") public addFormDataParamDialog: AddFormDataParamDialogComponent;
    @ViewChild("addQueryParamDialog") public addQueryParamDialog: AddQueryParamDialogComponent;
    @ViewChild("addResponseDialog") public addResponseDialog: AddResponseDialogComponent;

    protected createEmptyNodeForSource(): Oas20Operation {
        return (<Oas20PathItem>this.operation.parent()).createOperation(this.operation.method());
    }

    protected createReplaceNodeCommand(node: Oas20Operation): ICommand {
        return new ReplaceOperationCommand(this.operation, node);
    }

    public summary(): string {
        if (this.operation.summary) {
            return this.operation.summary;
        } else {
            return null;
        }
    }

    public hasSummary(): boolean {
        if (this.operation.summary) {
            return true;
        } else {
            return false;
        }
    }

    public description(): string {
        if (this.operation.description) {
            return this.operation.description;
        } else {
            return null;
        }
    }

    public hasDescription(): boolean {
        if (this.operation.description) {
            return true;
        } else {
            return false;
        }
    }

    public bodyParam(): Oas20Parameter {
        let params: Oas20Parameter[] = this.operation.parameters;
        if (params) {
            for (let param of params) {
                if (param.in === "body") {
                    return param;
                }
            }
        }
        return null;
    }

    public requestBodyType(): string {
        let bodyParam: Oas20Parameter = this.bodyParam();
        if (bodyParam && bodyParam.schema) {
            return SimplifiedType.fromSchema(bodyParam.schema).type;
        }
        return null;
    }

    public requestBodyTypeOf(): string {
        let bodyParam: Oas20Parameter = this.bodyParam();
        if (bodyParam && bodyParam.schema) {
            let st: SimplifiedType = SimplifiedType.fromSchema(bodyParam.schema);
            if (st.of) {
                return st.of.type;
            }
        }
        return null;
    }

    public requestBodyTypeAs(): string {
        let bodyParam: Oas20Parameter = this.bodyParam();
        if (bodyParam && bodyParam.schema) {
            let st: SimplifiedType = SimplifiedType.fromSchema(bodyParam.schema);
            if (st.isArray() && st.of) {
                return st.of.as;
            }
            if (st.isSimpleType()) {
                return st.as;
            }
        }
        return null;
    }

    public hasBodyParam(): boolean {
        if (this.bodyParam() !== null) {
            return true;
        } else {
            return false;
        }
    }

    public requestBodyTypeOptions(): DropDownOption[] {
        let options: DropDownOption[] = [
            { value: "array", name: "Array" },
            { divider: true },
            { value: "string", name: "String" },
            { value: "integer", name: "Integer" },
            { value: "boolean", name: "Boolean" },
            { value: "number", name: "Number" }
        ];

        let doc: Oas20Document = (<Oas20Document>this.operation.ownerDocument());
        if (doc.definitions) {
            let co: DropDownOption[] = doc.definitions.definitions().sort( (def1, def2) => {
                return def1.definitionName().toLocaleLowerCase().localeCompare(def2.definitionName().toLocaleLowerCase());
            }).map( def => {
                return {
                    value: "#/definitions/" + def.definitionName(),
                    name: def.definitionName()
                };
            });
            if (co && co.length > 0) {
                options.push({ divider: true });
                co.forEach( o => options.push(o) );
            }
        }

        return options;
    }

    public requestBodyTypeOfOptions(): DropDownOption[] {
        let options: DropDownOption[] = [
            { value: "string", name: "String" },
            { value: "integer", name: "Integer" },
            { value: "boolean", name: "Boolean" },
            { value: "number", name: "Number" }
        ];

        let doc: Oas20Document = (<Oas20Document>this.operation.ownerDocument());
        if (doc.definitions) {
            let co: DropDownOption[] = doc.definitions.definitions().sort( (def1, def2) => {
                return def1.definitionName().toLocaleLowerCase().localeCompare(def2.definitionName().toLocaleLowerCase());
            }).map( def => {
                return {
                    value: "#/definitions/" + def.definitionName(),
                    name: def.definitionName()
                };
            });
            if (co && co.length > 0) {
                options.push({ divider: true });
                co.forEach( o => options.push(o) );
            }
        }

        return options;
    }

    public requestBodyTypeAsOptions(): DropDownOption[] {
        let bodyParam: Oas20Parameter = this.bodyParam();
        if (ObjectUtils.isNullOrUndefined(bodyParam)) {
            return [];
        }
        if (ObjectUtils.isNullOrUndefined(bodyParam.schema)) {
            return [];
        }
        let options: DropDownOption[] = [];
        let st: SimplifiedType = SimplifiedType.fromSchema(this.bodyParam().schema);
        if (st.isArray() && st.of && st.of.isSimpleType()) {
            st = st.of;
        }
        if (st.type === "string") {
            options = [
                { value: null, name: "String" },
                { value: "byte", name: "Byte" },
                { value: "binary", name: "Binary" },
                { value: "date", name: "Date" },
                { value: "date-time", name: "DateTime" },
                { value: "password", name: "Password" }
            ];
        } else if (st.type === "integer") {
            options = [
                { value: null, name: "Integer" },
                { value: "int32", name: "32-Bit Integer" },
                { value: "int64", name: "64-Bit Integer" }
            ];
        } else if (st.type === "number") {
            options = [
                { value: null, name: "Number" },
                { value: "float", name: "Float" },
                { value: "double", name: "Double" }
            ];
        }
        return options;
    }

    public shouldShowRequestBodyTypeOf(): boolean {
        let bodyParam: Oas20Parameter = this.bodyParam();
        if (!bodyParam) {
            return false;
        }
        let nt: SimplifiedType = SimplifiedType.fromSchema(bodyParam.schema);
        return nt.isArray();
    }

    public shouldShowRequestBodyTypeAs(): boolean {
        let bodyParam: Oas20Parameter = this.bodyParam();
        if (!bodyParam) {
            return false;
        }
        let nt: SimplifiedType = SimplifiedType.fromSchema(bodyParam.schema);
        return (nt.isSimpleType() && nt.type !== "boolean") ||
               (nt.isArray() && nt.of && nt.of.isSimpleType() && nt.of.type !== "boolean");
    }

    public changeRequestBodyType(newType: string): void {
        let bodyParam: Oas20Parameter = this.bodyParam();
        let nt: SimplifiedType = new SimplifiedType();
        nt.type = newType;
        let command: ICommand = new ChangeParameterTypeCommand(bodyParam, nt);
        this.onCommand.emit(command);
    }

    public changeRequestBodyTypeOf(newOf: string): void {
        console.info("newOf: " + newOf);
        let bodyParam: Oas20Parameter = this.bodyParam();
        let newType: SimplifiedType = SimplifiedType.fromSchema(bodyParam.schema);
        newType.of = new SimplifiedType();
        newType.of.type = newOf;
        newType.as = null;
        console.info(newType);
        let command: ICommand = new ChangeParameterTypeCommand(bodyParam, newType);
        this.onCommand.emit(command);
    }

    public changeRequestBodyTypeAs(newAs: string): void {
        let bodyParam: Oas20Parameter = this.bodyParam();
        let newType: SimplifiedType = SimplifiedType.fromSchema(bodyParam.schema);
        if (newType.isSimpleType()) {
            newType.as = newAs;
        }
        if (newType.isArray() && newType.of) {
            newType.of.as = newAs;
        }
        let command: ICommand = new ChangeParameterTypeCommand(bodyParam, newType);
        this.onCommand.emit(command);
    }

    public bodyDescription(): string {
        let bodyParam: Oas20Parameter = this.bodyParam();
        if (bodyParam === null) {
            return "";
        }
        if (bodyParam.description) {
            return bodyParam.description;
        } else {
            return null;
        }
    }

    public parameters(paramType: string): Oas20Parameter[] {
        return this.operation.getParameters(paramType).sort((param1, param2) => {
            return param1.name.localeCompare(param2.name);
        });
    }

    public pathParam(paramName: string): Oas20Parameter {
        let param: Oas20Parameter = this.operation.parameter("path", paramName);

        if (param === null) {
            param = this.operation.createParameter();
            param.in = "path";
            param.name = paramName;
            param.required = true;
            param.n_attribute("missing", true);
        }

        return param;
    }

    public pathParameters(): Oas20Parameter[] {
        let pathParamNames: string[] = ModelUtils.detectPathParamNames((<Oas20PathItem>this.operation.parent()).path());
        return pathParamNames.map( pname => {
            return this.pathParam(pname);
        });
    }

    public queryParameters(): Oas20Parameter[] {
        let opParams: Oas20Parameter[] = this.parameters("query");
        let piParams: Oas20Parameter[] = (<Oas20PathItem>this.operation.parent()).getParameters("query");
        let hasOpParam = function(param: Oas20Parameter): boolean {
            var found: boolean = false;
            opParams.forEach( opParam => {
                if (opParam.name === param.name) {
                    found = true;
                }
            });
            return found;
        };
        piParams.forEach( param => {
            if (!hasOpParam(param)) {
                let missingParam: Oas20Parameter = this.operation.createParameter();
                missingParam.in = "query";
                missingParam.name = param.name;
                missingParam.required = true;
                missingParam.n_attribute("missing", true);
                opParams.push(missingParam);
            }
        });
        return opParams.sort((param1, param2) => {
            return param1.name.localeCompare(param2.name);
        });
    }

    public headerParameters(): Oas20Parameter[] {
        return this.parameters("header");
    }

    public formDataParameters(): Oas20Parameter[] {
        return this.parameters("formData");
    }

    public hasFormDataParams(): boolean {
        return this.hasParameters("formData");
    }

    public hasQueryParameters(): boolean {
        return this.operation.getParameters("query").length > 0 ||
            (<Oas20PathItem>this.operation.parent()).getParameters("query").length > 0;
    }

    public canHavePathParams(): boolean {
        return (<Oas20PathItem>this.operation.parent()).path().indexOf("{") !== -1;
    }

    public hasParameters(type: string): boolean {
        if (!this.operation.parameters) {
            return false;
        }
        return this.operation.parameters.filter((value) => {
            return value.in === type;
        }).length > 0;
    }

    public responses(): Oas20Response[] {
        if (!this.operation.responses) {
            return [];
        }
        let rval: Oas20Response[] = [];
        for (let scode of this.operation.responses.responseStatusCodes()) {
            let response: Oas20Response = this.operation.responses.response(scode);
            rval.push(response);
        }
        return rval.sort((a, b) => {
            return a.statusCode().localeCompare(b.statusCode());
        });
    }

    public hasResponses(): boolean {
        if (!this.operation.responses) {
            return false;
        }
        if (this.operation.responses.responseStatusCodes().length === 0) {
            return false;
        }

        return true;
    }

    public hasDefinitions(): boolean {
        if (this.definitionNames()) {
            return true;
        } else {
            return false;
        }
    }

    public definitionNames(): string[] {
        let doc: Oas20Document = <Oas20Document>this.operation.ownerDocument();
        if (ObjectUtils.isNullOrUndefined(doc.definitions)) {
            return [];
        } else {
            return doc.definitions.getItemNames().sort();
        }
    }

    public changeSummary(newSummary: string): void {
        let command: ICommand = new ChangePropertyCommand<string>("summary", newSummary, this.operation);
        this.onCommand.emit(command);
    }

    public changeDescription(newDescription: string): void {
        let command: ICommand = new ChangePropertyCommand<string>("description", newDescription, this.operation);
        this.onCommand.emit(command);
    }

    public changeBodyDescription(newBodyDescription: string): void {
        let bodyParam: Oas20Parameter = this.bodyParam();
        let command: ICommand = new ChangePropertyCommand<string>("description", newBodyDescription, bodyParam);
        this.onCommand.emit(command);
    }

    public changeParamDescription(param: Oas20Parameter, newParamDescription: string): void {
        let command: ICommand = new ChangePropertyCommand<string>("description", newParamDescription, param);
        this.onCommand.emit(command);
    }

    public changeParamType(param: Oas20Parameter, newType: SimplifiedType): void {
        let command: ICommand = new ChangeParameterTypeCommand(param, newType);
        this.onCommand.emit(command);
    }

    public changeResponseType(response: Oas20Response, newType: SimplifiedType): void {
        let command: ICommand = new ChangeResponseTypeCommand(response, newType);
        this.onCommand.emit(command);
    }

    public changeResponseDescription(response: Oas20Response, newDescription: string): void {
        let command: ICommand = new ChangePropertyCommand<string>("description", newDescription, response);
        this.onCommand.emit(command);
    }

    public createRequestBody(): void {
        let command: ICommand = new NewRequestBodyCommand(this.operation);
        this.onCommand.emit(command);
    }

    public delete(): void {
        let command: ICommand = new DeleteNodeCommand(this.operation.method(), this.operation.parent());
        this.onCommand.emit(command);
        this.onDeselect.emit(true);
    }

    public deleteRequestBody(): void {
        if (this.hasBodyParam()) {
            let command: ICommand = new DeleteAllParameters(this.operation, "body");
            this.onCommand.emit(command);
        } else {
            let command: ICommand = new DeleteAllParameters(this.operation, "formData");
            this.onCommand.emit(command);
        }
    }

    public deleteAllQueryParams(): void {
        let command: ICommand = new DeleteAllParameters(this.operation, "query");
        this.onCommand.emit(command);
    }

    public deleteAllResponses(): void {
        let command: ICommand = new DeleteNodeCommand("responses", this.operation);
        this.onCommand.emit(command);
    }

    public deleteParam(parameter: Oas20Parameter): void {
        let command: ICommand = new DeleteParameterCommand(parameter);
        this.onCommand.emit(command);
    }

    public deleteResponse(response: Oas20Response): void {
        let command: ICommand = new DeleteResponseCommand(response);
        this.onCommand.emit(command);
    }

    public openAddQueryParamModal(): void {
        this.addQueryParamDialog.open();
    }

    public openAddFormDataParamModal(): void {
        this.addFormDataParamDialog.open();
    }

    public addQueryParam(name: string): void {
        let command: ICommand = new NewParamCommand(this.operation, name, "query");
        this.onCommand.emit(command);
    }

    public addFormDataParam(name: string): void {
        let command: ICommand = new NewParamCommand(this.operation, name, "formData");
        this.onCommand.emit(command);
    }

    public openAddResponseModal(): void {
        this.addResponseDialog.open("200");
    }

    public addResponse(statusCode: string): void {
        let command: ICommand = new NewResponseCommand(this.operation, statusCode);
        this.onCommand.emit(command);
    }

    public createPathParam(paramName: string): void {
        let command: ICommand = new NewParamCommand(this.operation, paramName, "path");
        this.onCommand.emit(command);
    }

    public enableSourceMode(): void {
        this.sourceNode = this.operation;
        super.enableSourceMode();
    }
}
