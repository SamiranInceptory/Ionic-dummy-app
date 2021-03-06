import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input, OnChanges } from '@angular/core';
import { Capacitor, Plugins, CameraSource, CameraResultType } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {

  @Output() imagePick = new EventEmitter<string | File>();
  @ViewChild('filePicker') filePickerRef: ElementRef;
  @Input() showPreview = false;
  selectedImage: string;
  usePicker = false;
  constructor(private platform: Platform) { }

  ngOnInit() {
    if ((this.platform.is('mobile') && !this.platform.is('hybrid'))  || this.platform.is('desktop')){
      this.usePicker = true;
    }
  }

  onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera')){
      this.filePickerRef.nativeElement.click();
    }
    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      height: 320,
      width: 200,
      resultType: CameraResultType.DataUrl
    }).then(image => {
      console.log(image);
      this.selectedImage = image.dataUrl;
      this.imagePick.emit(image.dataUrl);
    }).catch(error => {
      console.log(error);
      this.filePickerRef.nativeElement.click();
      return;
    });
  }

  onFileChosen(event: Event){
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile){
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile)
    };
    fr.readAsDataURL(pickedFile);
  }

}
