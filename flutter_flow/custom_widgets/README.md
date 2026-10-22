# How to Install `DriverMonitorWidget` in FlutterFlow

Follow these exact steps in FlutterFlow:

### Step 1: Add Custom Dependencies
In the left sidebar of FlutterFlow, navigate to **Custom Code > Dependencies**:
Click **+ Add Dependency** and paste each:
- `camera: ^0.10.5+9`
- `audioplayers: ^6.0.0`
- `vibration: ^2.0.0`
- `geolocator: ^12.0.0`
- `sensors_plus: ^5.0.1`
- `cloud_firestore: ^5.0.2`
- `google_mlkit_face_mesh_detection: ^0.1.0`

### Step 2: Create the Custom Widget
1. In **Custom Code > Custom Widgets**, click **+ Add Widget**.
2. Widget Name: `DriverMonitorWidget`.
3. Add the following **Parameters**:
   - `width` (Double, Is List: False, Nullable: False)
   - `height` (Double, Is List: False, Nullable: False)
   - `language` (String, Is List: False, Nullable: False)
   - `vehicleId` (String, Is List: False, Nullable: False)
   - `fleetId` (String, Is List: False, Nullable: False)
   - `driverId` (String, Is List: False, Nullable: False)
   - `isCalibrated` (Boolean, Is List: False, Nullable: False, Default: True)
   - `onAlertTriggered` (Action, Nullable: True)
4. Replace the widget code with the contents of `DriverMonitorWidget.dart`.
5. Click **Save** and **Compile / Check Code**.

### Step 3: Add Audio Assets to FlutterFlow
Upload the regional prompt audio files in **Settings > Assets > Audio Assets**:
- `audio/hi_l1_attention.mp3`
- `audio/hi_l3_stop.mp3`
- `audio/kn_l1_attention.mp3`
- `audio/kn_l3_stop.mp3`
- `audio/ta_l1_attention.mp3`
- `audio/ta_l3_stop.mp3`
- `audio/te_l1_attention.mp3`
- `audio/te_l3_stop.mp3`
- `audio/mr_l1_attention.mp3`
- `audio/mr_l3_stop.mp3`
- `audio/en_l1_attention.mp3`
- `audio/en_l3_stop.mp3`
- `audio/piercing_siren.mp3`

### Step 4: Drop Widget into Screen 3 (Active Drive Mode)
1. On Screen 3, add a Container with color `#000000` (Pure Black).
2. Drag `DriverMonitorWidget` into the container.
3. Bind parameters to App State variables:
   - `language`: `FFAppState().appLanguage`
   - `vehicleId`: `FFAppState().vehicleNumber`
   - `fleetId`: `FFAppState().fleetId`
   - `driverId`: `FFAppState().driverId`
4. Set width and height to `100%` (Expanded).
