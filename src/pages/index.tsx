// src/pages/index.tsx
import type { NextPage } from 'next'
import Head from 'next/head'
import NextLink from "next/link"
import { VStack, Heading, Box, LinkOverlay, LinkBox} from "@chakra-ui/layout"
import {Button, Input , NumberInput,  NumberInputField,  FormControl,  FormLabel, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { ethers, providers, BigNumber } from 'ethers'
import WalletConnectProvider from "@walletconnect/web3-provider";

const CONTRACT_ADDRESS = "0xa8CAe66f62648529eB6aC2F026893Fc436107510";

declare let window:any

const provider = new WalletConnectProvider({
  rpc: {
    //32769: "http://localhost:5555",
    33101: "https://evmdev-l2api.dev.z7a.xyz"
  }
})

const Home: NextPage = () => {
  const [balance, setBalance] = useState<string | undefined>()
  const [currentAccount, setCurrentAccount] = useState<string | undefined>()
  const [chainId, setChainId] = useState<number | undefined>()
  const [chainname, setChainName] = useState<string | undefined>()
  const [amount,setAmount]=useState<string>('200000000000000000')
  const [toAddress, setToAddress]=useState<string>("0xCF671756a8238cBeB19BCB4D77FC9091E2fCe1A3")

  useEffect(() => {
    if(!currentAccount || !ethers.utils.isAddress(currentAccount)) return
    //client side code
    //if(!window.ethereum) return

    const web3Provider = new providers.Web3Provider(provider);
    console.log("Get balance", currentAccount)
    web3Provider.getBalance(currentAccount).then((result)=>{
      setBalance(ethers.utils.formatEther(result))
    }).catch(e => {
      console.error(`Can't get balance of ${currentAccount}, ${e}`)
    })
    web3Provider.getNetwork().then((result)=>{
      setChainId(result.chainId)
      setChainName(result.name)
    })

  },[currentAccount])

  const onClickConnect = async () => {

    await provider.enable();
    console.log("Enabled");
    //const web3Provider = new providers.Web3Provider(window.ethereum);
    const web3Provider = new providers.Web3Provider(provider);
    window.eth = web3Provider;
    const accounts = await web3Provider.listAccounts();
    console.log(accounts);
    // Subscribe to accounts change
    setCurrentAccount(accounts[0]);
  }

  const onSendTransaction = async () => {
    const web3Provider = window.eth;
    console.log(`To: ${toAddress}, Value: ${amount}`)
    web3Provider.getSigner().sendTransaction({
      to: toAddress,
      value: amount,
    }).then((p: any) => console.log(p)).catch((e: any)=>console.log(`Error: ${e}`));
  }

  const onClickDisconnect = () => {
    setBalance(undefined);
    setCurrentAccount(undefined);
  }

  const handleChange = (value:string) => setAmount(value)

  return (
    <>
      <Head>
        <title>Zilliqa</title>
      </Head>

      <Heading as="h3"  my={4}>Zilliqa WalletConnect Tester</Heading>          
      <VStack>
        <Box w='100%' my={4}>
          {currentAccount  
            ? <Button type="button" w='100%' onClick={onClickDisconnect}>
                  Account:{currentAccount}
              </Button>
            : <Button colorScheme='blue' variant='solid' type="button" w='100%' onClick={onClickConnect}>
                    Connect WalletConnect
                </Button>
          }
        </Box>
        {currentAccount  
          ?<Box  mb={0} p={4} w='100%' borderWidth="1px" borderRadius="lg">
          <Heading my={4}  fontSize='xl'>Account info</Heading>
          <Text>ETH Balance of current account: {balance}</Text>
          <Text>Chain Info: ChainId {chainId} name {chainname}</Text>
        </Box>
        :<></>
        }
        <Box>
          <form onSubmit={onSendTransaction}>
          <FormControl>
          <FormLabel htmlFor='amount'>Amount: </FormLabel>
            <NumberInput defaultValue={amount} min={10} max={1000} onChange={handleChange}>
              <NumberInputField />
            </NumberInput>
            <FormLabel htmlFor='toaddress'>To address: </FormLabel>
            <Input id="toaddress" defaultValue={toAddress} type="text" required  onChange={(e) => setToAddress(e.target.value)} my={3}/>
            <Button isDisabled={!currentAccount} onClick={onSendTransaction}>Transfer</Button>
          </FormControl>
          </form>
        </Box>
      </VStack>
    </>
  )
}

export default Home
