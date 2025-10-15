import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, FormGroupName, Validators } from '@angular/forms';
import { SntTransporterTransportType } from 'src/app/api/GCPClient';
import { SntSectionsNames } from '../SntSectionsNames';
import { SntSectionEValidators } from './snt-section-e.validators';

@Component({
    selector: 'app-snt-section-e',
    templateUrl: './snt-section-e.component.html',
    styleUrls: ['./snt-section-e.component.scss'],
    standalone: false
})
export class SntSectionEComponent implements OnInit, AfterViewInit  {

  @Input() draftSntForm : UntypedFormGroup;
  @Input() shippingInfo: FormGroupName
  multiModal: boolean = false;

  sntSectionsNames = SntSectionsNames

  sntTransporterTransportTypes = SntTransporterTransportType;
  constructor(
    private cdRef : ChangeDetectorRef
  ) { 
  }
  

  ngOnInit(): void {
    this.multiModal = ((this.draftSntForm.get('shippingInfo.transportTypes') as UntypedFormArray).value as string[]).includes(SntTransporterTransportType.MULTIMODAL)
  }
  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
  }
  // TODO move this logic into the validator class of section E and try to reduce its volume
  onMultipleCheckboxChange(checked: boolean, value: string){
    const formArray: UntypedFormArray = this.draftSntForm.get('shippingInfo.transportTypes') as UntypedFormArray;
    if(checked){
      switch(value){
        case SntTransporterTransportType.MULTIMODAL:{
          this.multiModal = true;
          SntSectionEValidators.unchecked(
            [
              this.draftSntForm.get('shippingInfo.carCheckBox'), 
              this.draftSntForm.get('shippingInfo.shipCheckBox'),
              this.draftSntForm.get('shippingInfo.carriageCheckBox'),
              this.draftSntForm.get('shippingInfo.boardCheckBox'),
              this.draftSntForm.get('shippingInfo.pipelineCheckBox'),
              this.draftSntForm.get('shippingInfo.otherCheckBox')
            ]
          )
          SntSectionEValidators.disableAndSetValueElements(
            [
              this.draftSntForm.get('shippingInfo.carriageNumber'),
              this.draftSntForm.get('shippingInfo.shipNumber'), 
              this.draftSntForm.get('shippingInfo.carStateNumber'),
              this.draftSntForm.get('shippingInfo.trailerStateNumber'),
              this.draftSntForm.get('shippingInfo.boardNumber')
            ], ''
          )
          break;
        }
        case SntTransporterTransportType.AUTOMOBILE: {
          (this.draftSntForm.get('shippingInfo.carStateNumber') as UntypedFormControl).setValidators([Validators.required, Validators.pattern(/^[а-яА-Яa-zA-Z0-9Ëё]+$/i)])
          SntSectionEValidators.enable(this.draftSntForm.get('shippingInfo.carStateNumber'));
          SntSectionEValidators.enable(this.draftSntForm.get('shippingInfo.trailerStateNumber'))
          if(!this.multiModal){
            SntSectionEValidators.unchecked(
              [
                this.draftSntForm.get('shippingInfo.carriageCheckBox'), 
                this.draftSntForm.get('shippingInfo.boardCheckBox'),
                this.draftSntForm.get('shippingInfo.shipCheckBox'),
                this.draftSntForm.get('shippingInfo.pipelineCheckBox'),
                this.draftSntForm.get('shippingInfo.otherCheckBox')
              ]
            )
            SntSectionEValidators.disableAndSetValueElements(
              [
                this.draftSntForm.get('shippingInfo.carriageNumber'),
                this.draftSntForm.get('shippingInfo.shipNumber'), 
                this.draftSntForm.get('shippingInfo.boardNumber') 
              ], ''
            )
          }
          break;
        }
        case SntTransporterTransportType.RAILWAY: {
          SntSectionEValidators.enable(this.draftSntForm.get('shippingInfo.carriageNumber'))
          if(!this.multiModal){
            SntSectionEValidators.unchecked(
              [
                this.draftSntForm.get('shippingInfo.carCheckBox'), 
                this.draftSntForm.get('shippingInfo.boardCheckBox'),
                this.draftSntForm.get('shippingInfo.shipCheckBox'),
                this.draftSntForm.get('shippingInfo.pipelineCheckBox'),
                this.draftSntForm.get('shippingInfo.otherCheckBox')
              ]
            )
            SntSectionEValidators.disableAndSetValueElements(
              [
                this.draftSntForm.get('shippingInfo.shipNumber'), 
                this.draftSntForm.get('shippingInfo.carStateNumber'),
                this.draftSntForm.get('shippingInfo.trailerStateNumber'),
                this.draftSntForm.get('shippingInfo.boardNumber')
              ], ''
            )
          }
          break;
        }
        case SntTransporterTransportType.MARINE: {
          SntSectionEValidators.enable(this.draftSntForm.get('shippingInfo.shipNumber'))
          if(!this.multiModal){
            SntSectionEValidators.unchecked(
              [
                this.draftSntForm.get('shippingInfo.carCheckBox'), 
                this.draftSntForm.get('shippingInfo.boardCheckBox'),
                this.draftSntForm.get('shippingInfo.carriageCheckBox'),
                this.draftSntForm.get('shippingInfo.pipelineCheckBox'),
                this.draftSntForm.get('shippingInfo.otherCheckBox')
              ]
            )
            SntSectionEValidators.disableAndSetValueElements(
              [
                this.draftSntForm.get('shippingInfo.carriageNumber'),
                this.draftSntForm.get('shippingInfo.carStateNumber'),
                this.draftSntForm.get('shippingInfo.trailerStateNumber'),
                this.draftSntForm.get('shippingInfo.boardNumber')
              ], ''
            )
          }
          break;
        }
        case SntTransporterTransportType.AIR: {
          SntSectionEValidators.enable(this.draftSntForm.get('shippingInfo.boardNumber'))
          if(!this.multiModal){
            SntSectionEValidators.unchecked(
              [
                this.draftSntForm.get('shippingInfo.carCheckBox') as UntypedFormControl, 
                this.draftSntForm.get('shippingInfo.shipCheckBox') as UntypedFormControl,
                this.draftSntForm.get('shippingInfo.carriageCheckBox') as UntypedFormControl,
                this.draftSntForm.get('shippingInfo.pipelineCheckBox') as UntypedFormControl,
                this.draftSntForm.get('shippingInfo.otherCheckBox') as UntypedFormControl
              ]
            )
            SntSectionEValidators.disableAndSetValueElements(
              [
                this.draftSntForm.get('shippingInfo.carriageNumber') as UntypedFormControl,
                this.draftSntForm.get('shippingInfo.shipNumber') as UntypedFormControl, 
                this.draftSntForm.get('shippingInfo.carStateNumber') as UntypedFormControl,
                this.draftSntForm.get('shippingInfo.trailerStateNumber') as UntypedFormControl,
              ], ''
            )
          }
          break;
        }
        case SntTransporterTransportType.PIPELINE: {
          SntSectionEValidators.enable(this.draftSntForm.get('shippingInfo'), false)
          if(!this.multiModal){
            SntSectionEValidators.unchecked(
              [
                this.draftSntForm.get('shippingInfo.carCheckBox'), 
                this.draftSntForm.get('shippingInfo.shipCheckBox'),
                this.draftSntForm.get('shippingInfo.carriageCheckBox'),
                this.draftSntForm.get('shippingInfo.boardCheckBox'),
                this.draftSntForm.get('shippingInfo.otherCheckBox')
              ]
            )
            SntSectionEValidators.disableAndSetValueElements(
              [
                this.draftSntForm.get('shippingInfo.carriageNumber'),
                this.draftSntForm.get('shippingInfo.shipNumber'), 
                this.draftSntForm.get('shippingInfo.carStateNumber'),
                this.draftSntForm.get('shippingInfo.trailerStateNumber'),
                this.draftSntForm.get('shippingInfo.boardNumber')
              ], ''
            )
          }
          break;
        }
        case SntTransporterTransportType.OTHER: {
          SntSectionEValidators.enable(this.draftSntForm.get('shippingInfo'), false)
          if(!this.multiModal){
            SntSectionEValidators.unchecked(
              [
                this.draftSntForm.get('shippingInfo.carCheckBox'), 
                this.draftSntForm.get('shippingInfo.shipCheckBox'),
                this.draftSntForm.get('shippingInfo.carriageCheckBox'),
                this.draftSntForm.get('shippingInfo.boardCheckBox'),
                this.draftSntForm.get('shippingInfo.pipelineCheckBox'),
              ]
            )
            SntSectionEValidators.disableAndSetValueElements(
              [
                this.draftSntForm.get('shippingInfo.carriageNumber'),
                this.draftSntForm.get('shippingInfo.shipNumber'), 
                this.draftSntForm.get('shippingInfo.carStateNumber'),
                this.draftSntForm.get('shippingInfo.trailerStateNumber'),
                this.draftSntForm.get('shippingInfo.boardNumber')
              ], ''
            )
          }
          break;
        }
      }
      if(!(formArray.value as string[]).includes(SntTransporterTransportType.MULTIMODAL)) formArray.clear();
      formArray.push(new UntypedFormControl(value));
    }
    else{
      switch(value){
        case SntTransporterTransportType.MULTIMODAL:{
          this.multiModal = false;
          SntSectionEValidators.unchecked(
            [
              this.draftSntForm.get('shippingInfo.carCheckBox'), 
              this.draftSntForm.get('shippingInfo.shipCheckBox'),
              this.draftSntForm.get('shippingInfo.carriageCheckBox'),
              this.draftSntForm.get('shippingInfo.boardCheckBox'),
              this.draftSntForm.get('shippingInfo.pipelineCheckBox'),
              this.draftSntForm.get('shippingInfo.otherCheckBox')
            ]
          )
          SntSectionEValidators.disableAndSetValueElements(
            [
              this.draftSntForm.get('shippingInfo.carriageNumber'),
              this.draftSntForm.get('shippingInfo.shipNumber'), 
              this.draftSntForm.get('shippingInfo.carStateNumber'),
              this.draftSntForm.get('shippingInfo.trailerStateNumber'),
              this.draftSntForm.get('shippingInfo.boardNumber'),
              
            ], ''
          )
          break;
        }
        case SntTransporterTransportType.AUTOMOBILE: {
          (this.draftSntForm.get('shippingInfo.carStateNumber') as UntypedFormControl).clearValidators()
          SntSectionEValidators.DisableAndSetValueElement((this.draftSntForm.get('shippingInfo.carStateNumber') as UntypedFormControl), '')
          SntSectionEValidators.disable(this.draftSntForm.get('shippingInfo.trailerStateNumber'))
          break;
        }
        case SntTransporterTransportType.RAILWAY: {
          SntSectionEValidators.disable(this.draftSntForm.get('shippingInfo.carriageNumber'))
          break;
        }
        case SntTransporterTransportType.MARINE: {
          SntSectionEValidators.disable(this.draftSntForm.get('shippingInfo.shipNumber'))
          break;
        }
        case SntTransporterTransportType.AIR: {
          SntSectionEValidators.disable(this.draftSntForm.get('shippingInfo.boardNumber'))
          break;
        }
        case SntTransporterTransportType.PIPELINE: {
          SntSectionEValidators.disable(this.draftSntForm.get('shippingInfo'), false)
          break;
        }
        case SntTransporterTransportType.OTHER: {
          SntSectionEValidators.disable(this.draftSntForm.get('shippingInfo'), false)
          break;
        }
      }

      let i: number = 0;
      formArray.controls.forEach((ctrl: UntypedFormControl) => {
        if(ctrl.value == value) {
          formArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }
}
