package com.artesaniasguapinol.app;

import android.content.Context;
import android.content.res.Configuration;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void attachBaseContext(Context newBase) {
        Configuration config = new Configuration(newBase.getResources().getConfiguration());
        config.fontScale = Math.min(config.fontScale, 1.15f);
        Context scaled = newBase.createConfigurationContext(config);
        super.attachBaseContext(scaled);
    }
}
