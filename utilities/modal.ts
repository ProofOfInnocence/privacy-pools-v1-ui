// import { Component } from 'vue'

// import { ModalProps } from '@/types'

// const modalSizes = {
//   MIN: 380,
//   BIG: 760,
// }

// const MAX_WIDTHS: { [key in string]: number } = {
//   BackupModal: modalSizes.MIN,
//   SuccessModal: modalSizes.MIN,
//   AccountModal: modalSizes.BIG,
//   ConnectModal: modalSizes.MIN,
//   ContinueModal: modalSizes.MIN,
//   SettingsModal: modalSizes.MIN,
//   MergeInputsModal: modalSizes.MIN,
//   ConfirmationModal: modalSizes.MIN,
//   ChangeAccountModal: modalSizes.MIN,
//   ElementChooserModal: modalSizes.MIN,
// }

// const createModalArgs = (component: Component, componentProps = {}, modalProps: ModalProps = {}) => {
//   if (!component.name) {
//     throw new Error('Pulling component must have NAME property')
//   }

//   if (MAX_WIDTHS[component.name]) {
//     modalProps.width = MAX_WIDTHS[component.name]
//   }

//   return [component, { modalName: component.name, ...componentProps }, { name: component.name, ...modalProps }]
// }

// export { createModalArgs }
export {}