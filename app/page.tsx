"use client";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import QRCode from 'react-qr-code';

export default function Home() {
  const [address, setAddress] = useState('');
  const [contributions, setContributions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [requestUrl, setRequestUrl] = useState('');
  const [proofs, setProofs] = useState('');
  const APP_ID = "YOUR_APP_ID";
  const APP_SECRET = "YOUR_APP_SECRET";
  const PROVIDER_ID = "GITHUB_PROVIDER_ID";

  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = provider.getSigner();
          const address = (await (await signer).getAddress());
          setAddress(address);
        } else {
          throw new Error('Ethereum is not available');
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  }

  async function verifyGithubContributions() {
    setLoading(true);
    try {
      const APP_ID = "0x50f48049c72bAFc0f2F3c6C6F48B6d0271C38F83";
      const APP_SECRET = "0xfdc1ae446cb63567b570aab15fc035378c53efbd59b969d5bb6b53860e85d0eb";
      const PROVIDER_ID = "8573efb4-4529-47d3-80da-eaa7384dac19";
      const reclaimProofRequest = ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID)

      // const request = await reclaim.request({
      //   title: 'GitHub Contributions Verification',
      //   callbackUrl: window.location.origin,
      //   appId: APP_ID,
      //   appSecret: APP_SECRET,
      //   providers: [{
      //     provider: PROVIDER_ID,
      //     params: {}
      //   }]
      // });

      // const { requestId } = request;
      // const proofUrl = request.generateUrl();

      // window.location.href = proofUrl||"";

      const requestUrl = (await (await reclaimProofRequest).getRequestUrl());
      console.log('Request URL:', requestUrl);
      setRequestUrl(requestUrl);


      let finalProof = "";
      // Start listening for proof submissions
      (await reclaimProofRequest).startSession({
        // Called when the user successfully completes the verification
        onSuccess: (proofs) => {
          if (proofs) {
            if (typeof proofs === 'string') {
              // When using a custom callback url, the proof is returned to the callback url and we get a message instead of a proof
              console.log('SDK Message:', proofs);
              setProofs(proofs);
              finalProof = proofs
              // setProofs([proofs]);

            } else if (typeof proofs !== 'string') {
              // When using the default callback url, we get a proof object in the response
              console.log('Verification success', proofs?.claimData.context);
              setProofs(JSON.stringify(proofs));
              finalProof = JSON.stringify(proofs)
            }
            // send request to server with body {proofs}
          }
        },
        // Called if there's an error during verification
        onError: (error: any) => {
          console.error('Verification failed', error);
        },
      });
      await fetch('/api/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proofs: finalProof }),
      });
    } catch (error) {
      console.error('Error verifying contributions:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">GitHub Contributor Rewards</h1>

        {!address ? (
          <button
            onClick={connectWallet}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Connect Wallet
          </button>
        ) : (
          <div>
            <p>Connected: {address}</p>
            <button
              onClick={verifyGithubContributions}
              className="bg-green-500 text-white px-4 py-2 rounded mt-4"
              disabled={loading}
            >

            {loading ? 'Verifying...' : 'Verify GitHub Contributions'}
            </button>
            {requestUrl && (
              <div style={{ margin: '20px 0' }}>
                <QRCode value={requestUrl} />
              </div>
            )}
            {proofs && (
              <div>
                <h2>Verification Successful!</h2>
                <pre>{JSON.stringify(proofs, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}