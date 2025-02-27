/*
 * MainActivity.kt
 * Android WebView Sample Demo
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 */
package com.amazonaws.android_webview_sample

import android.content.ContentValues.TAG
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.webkit.WebView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.amazonaws.android_webview_sample.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    companion object {
        var pushEnabled = true;
    }
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val binding = ActivityMainBinding.inflate(
            layoutInflater
        )
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO);

        setContentView(binding.root)

        setSupportActionBar(findViewById(R.id.toolbar))

        askNotificationPermission()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true)
        }

        binding.launchWebviewButton.setOnClickListener {
            replaceFragment(WebViewFragment(), addToBackStack = true)
        }

        supportFragmentManager.addOnBackStackChangedListener {
            updateBackButton()
        }


        /*
         Uncomment this to test push notification
         Make sure to uncomment google services dependencies and plugin in build.gradle files
         Also do not forget to add google-services.json to src
        */

//        FirebaseMessaging.getInstance().token.addOnCompleteListener(OnCompleteListener { task ->
//            if (!task.isSuccessful) {
//                Log.w(TAG, "Fetching FCM registration token failed", task.exception)
//                return@OnCompleteListener
//            }
//
//            // Get new FCM registration token
//            val token = task.result
//
//            // Log and toast
//            Log.d(TAG, "Device token: ${token}")
//            Toast.makeText(baseContext, token, Toast.LENGTH_SHORT).show()
//        })
    }

    /**
     * Replace fragment inside the FrameLayout
     */
    private fun replaceFragment(fragment: Fragment, addToBackStack: Boolean) {
        val transaction = supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)

        if (addToBackStack) {
            transaction.addToBackStack(null)
        }

        transaction.commit()
    }

    /**
     * Show/hide the Back Button based on active fragment
     */
    private fun updateBackButton() {
        val showBackButton = supportFragmentManager.backStackEntryCount > 0
        supportActionBar?.setDisplayHomeAsUpEnabled(showBackButton)
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }

    // Declare the launcher at the top of your Activity/Fragment:
    private val requestPermissionLauncher = registerForActivityResult(
            ActivityResultContracts.RequestPermission(),
    ) { isGranted: Boolean ->
        if (isGranted) {
            // FCM SDK (and your app) can post notifications.
        } else {
            // TODO: Inform user that that your app will not show notifications.
        }
    }

    private fun askNotificationPermission() {
        // This is only necessary for API level >= 33 (TIRAMISU)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.POST_NOTIFICATIONS) ==
                    PackageManager.PERMISSION_GRANTED
            ) {
                // FCM SDK (and your app) can post notifications.
            } else if (shouldShowRequestPermissionRationale(android.Manifest.permission.POST_NOTIFICATIONS)) {
                // TODO: display an educational UI explaining to the user the features that will be enabled
                //       by them granting the POST_NOTIFICATION permission. This UI should provide the user
                //       "OK" and "No thanks" buttons. If the user selects "OK," directly request the permission.
                //       If the user selects "No thanks," allow the user to continue without notifications.
            } else {
                // Directly ask for the permission
                requestPermissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    override fun onStop() {
        super.onStop()
        Log.d(TAG,"Lifecycle event received: onStop");
        // resume notification
        pushEnabled = true;
    }

    override fun onPause() {
        super.onPause()
        Log.d(TAG,"Lifecycle event received: onPause");
        // resume notification
        pushEnabled = true;
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG,"Lifecycle event received: onDestroy");
        // resume notification
        pushEnabled = true;
    }

    override fun onRestart() {
        super.onRestart()
        Log.d(TAG,"Lifecycle event received: onRestart");
        // stop notification
        pushEnabled = false;
    }

    override fun onResume() {
        super.onResume()
        Log.d(TAG,"Lifecycle event received: onResume");
        // stop notification
        pushEnabled = false;
    }
}